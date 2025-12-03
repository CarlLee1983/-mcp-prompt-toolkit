import path from 'path'
import { validateRegistry } from './validateRegistry'
import { validatePromptFile } from './validatePromptFile'

export function validatePromptRepo(repoRoot: string) {
  const registryPath = path.join(repoRoot, 'registry.yaml')

  const registry = validateRegistry(registryPath, repoRoot)
  if (!registry.success) {
    return { passed: false, errors: registry.error.errors }
  }

  const errors: any[] = []

  for (const group of Object.values(registry.data.groups)) {
    if (!group.enabled) continue
    for (const file of group.prompts) {
      const full = path.join(repoRoot, group.path, file)
      const res = validatePromptFile(full)
      if (!res.success) errors.push({ file, errors: res.error.errors })
    }
  }

  return {
    passed: errors.length === 0,
    errors
  }
}
