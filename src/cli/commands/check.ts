import { Command } from 'commander'
import path from 'path'
import fs from 'fs'
import type { Severity, ToolkitError } from '../../types/errors'
import { validatePartialsUsage } from '../../validators/validatePartialsUsage'
import { validateRegistry } from '../../validators/validateRegistry'
import { validatePromptFile } from '../../validators/validatePromptFile'
import { writeOutput, OutputFormat } from '../utils/output'
import { formatValidationErrors, formatValidationErrorsJson } from '../utils/formatters'
import { Logger } from '../utils/logger'
import ora from 'ora'

const SEVERITY_LEVELS: Record<Severity, number> = {
  fatal: -1,
  error: 0,
  warning: 1,
  info: 2
}

function filterBySeverity(errors: ToolkitError[], minSeverity: Severity): ToolkitError[] {
  const minLevel = SEVERITY_LEVELS[minSeverity]
  return errors.filter(error => SEVERITY_LEVELS[error.severity] <= minLevel)
}

function hasFatalErrors(errors: ToolkitError[]): boolean {
  return errors.some(error => error.severity === 'fatal')
}

export const checkCommand = new Command('check')
  .description('Check prompt repository components')

checkCommand
  .command('partials')
  .description('Check partials usage (missing partials and circular dependencies)')
  .argument('[path]', 'Repository root path', process.cwd())
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .option('-o, --output <file>', 'Output file path')
  .option('-s, --severity <level>', 'Minimum severity level (fatal|error|warning|info)', 'error')
  .action(async (repoPath: string, options: { format: OutputFormat; output?: string; severity: string }) => {
    const spinner = ora('Checking partials usage...').start()

    try {
      const resolvedPath = path.resolve(repoPath)

      if (!fs.existsSync(resolvedPath)) {
        spinner.fail(`Repository path does not exist: ${resolvedPath}`)
        process.exit(1)
      }

      const registryPath = path.join(resolvedPath, 'registry.yaml')
      if (!fs.existsSync(registryPath)) {
        spinner.fail(`Registry file not found: ${registryPath}`)
        process.exit(1)
      }

      const registry = validateRegistry(registryPath, resolvedPath)
      if (!registry.success) {
        spinner.fail('Registry validation failed')
        Logger.error('Cannot check partials: registry is invalid')
        process.exit(1)
      }

      const partialRoot = registry.data.partials?.enabled
        ? path.join(resolvedPath, registry.data.partials.path)
        : null

      if (!partialRoot) {
        spinner.warn('Partials are not enabled in registry')
        if (options.format === 'json') {
          writeOutput({ enabled: false, message: 'Partials are not enabled' }, options)
        } else {
          Logger.warning('Partials are not enabled in registry')
        }
        process.exit(0)
      }

      const allErrors: import('../../types/errors').ToolkitError[] = []

      for (const group of Object.values(registry.data.groups)) {
        if (!group.enabled) continue

        for (const file of group.prompts) {
          const full = path.join(resolvedPath, group.path, file)
          const res = validatePromptFile(full)

          if (!res.success) continue

          const usageErrors = validatePartialsUsage(
            res.data.template,
            partialRoot,
            {
              checkUnused: true,
              file: full
            }
          )

          allErrors.push(...usageErrors)
        }
      }

      const severity = options.severity as Severity
      const filteredErrors = filterBySeverity(allErrors, severity)
      const shouldExit = hasFatalErrors(filteredErrors) || filteredErrors.length > 0

      if (filteredErrors.length === 0) {
        spinner.succeed('No partials usage issues found!')
        if (options.format === 'json') {
          writeOutput({ passed: true, errors: [] }, options)
        } else {
          Logger.success('All partials are valid!')
        }
        process.exit(0)
      } else {
        spinner.fail(`Found ${filteredErrors.length} partials usage issue(s)!`)
        if (options.format === 'json') {
          writeOutput({
            passed: false,
            ...formatValidationErrorsJson(filteredErrors)
          }, options)
        } else {
          // eslint-disable-next-line no-console
          console.log(formatValidationErrors(filteredErrors))
        }
        process.exit(shouldExit ? 1 : 0)
      }
    } catch (error) {
      spinner.fail('Check error occurred')
      Logger.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

