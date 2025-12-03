import path from 'path'
import type { Severity, ToolkitError } from '../types/errors'
import { validateRegistry } from './validateRegistry'
import { validatePromptFile } from './validatePromptFile'
import { validatePartialsUsage } from './validatePartialsUsage'

export interface ValidatePromptRepoOptions {
  minSeverity?: Severity
}

const SEVERITY_LEVELS: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
  debug: 3
}

function filterBySeverity(errors: ToolkitError[], minSeverity: Severity = 'error'): ToolkitError[] {
  const minLevel = SEVERITY_LEVELS[minSeverity]
  return errors.filter(error => SEVERITY_LEVELS[error.severity] <= minLevel)
}

export interface ValidatePromptRepoResult {
  passed: boolean
  errors: ToolkitError[]
}

export function validatePromptRepo(
  repoRoot: string,
  options: ValidatePromptRepoOptions = {}
): ValidatePromptRepoResult {
  const registryPath = path.join(repoRoot, 'registry.yaml')
  const allErrors: ToolkitError[] = []

  const registry = validateRegistry(registryPath, repoRoot)
  if (!registry.success) {
    const filtered = filterBySeverity(registry.errors || [], options.minSeverity)
    return {
      passed: filtered.length === 0,
      errors: filtered
    }
  }

  // Add registry errors if any
  if (registry.errors) {
    allErrors.push(...registry.errors)
  }

  if (!registry.data) {
    const filtered = filterBySeverity(allErrors, options.minSeverity)
    return {
      passed: filtered.length === 0,
      errors: filtered
    }
  }

  const partialRoot = registry.data.partials?.enabled
    ? path.join(repoRoot, registry.data.partials.path)
    : null

  for (const [groupName, group] of Object.entries(registry.data.groups)) {
    if (!group.enabled) continue

    for (const file of group.prompts) {
      const full = path.join(repoRoot, group.path, file)
      const res = validatePromptFile(full)

      if (!res.success) {
        // Add file path to each error
        const fileErrors = (res.errors || []).map(err => ({
          ...err,
          file: full
        }))
        allErrors.push(...fileErrors)
        continue
      }

      if (partialRoot && res.data) {
        const usageErrors = validatePartialsUsage(
          res.data.template,
          partialRoot,
          {
            checkUnused: false, // Don't check unused in repo validation
            file: full
          }
        )
        allErrors.push(...usageErrors)
      }
    }
  }

  const filtered = filterBySeverity(allErrors, options.minSeverity)
  return {
    passed: filtered.length === 0,
    errors: filtered
  }
}
