import { Command } from 'commander'
import path from 'path'
import fs from 'fs'
import type { Severity, ToolkitError } from '../../types/errors'
import { validatePromptRepo } from '../../validators/validateRepo'
import { validateRegistry } from '../../validators/validateRegistry'
import { validatePromptFile } from '../../validators/validatePromptFile'
import { validatePartials } from '../../validators/validatePartials'
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

export const validateCommand = new Command('validate')
  .description('Validate prompt repository components')

validateCommand
  .command('repo')
  .description('Validate entire prompt repository')
  .argument('[path]', 'Repository root path', process.cwd())
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .option('-o, --output <file>', 'Output file path')
  .option('--exit-code', 'Exit with non-zero code on validation failure', false)
  .option('-s, --severity <level>', 'Minimum severity level (fatal|error|warning|info)', 'error')
  .action(async (repoPath: string, options: { format: OutputFormat; output?: string; exitCode: boolean; severity: string }) => {
    const spinner = ora('Validating repository...').start()

    try {
      const resolvedPath = path.resolve(repoPath)
      if (!fs.existsSync(resolvedPath)) {
        spinner.fail(`Repository path does not exist: ${resolvedPath}`)
        process.exit(1)
      }

      const severity = options.severity as Severity
      const result = validatePromptRepo(resolvedPath, { minSeverity: severity })

      if (result.passed) {
        spinner.succeed('Repository validation passed!')
        if (options.format === 'json') {
          writeOutput({ 
            passed: true, 
            errors: [],
            summary: result.summary
          }, options)
        } else {
          Logger.success('All validations passed!')
        }
        process.exit(0)
      } else {
        spinner.fail('Repository validation failed!')
        const shouldExit = options.exitCode || hasFatalErrors(result.errors)
        if (options.format === 'json') {
          writeOutput({
            passed: false,
            ...formatValidationErrorsJson(result.errors),
            summary: result.summary
          }, options)
        } else {
          // eslint-disable-next-line no-console
          console.log(formatValidationErrors(result.errors))
        }
        process.exit(shouldExit ? 1 : 0)
      }
    } catch (error) {
      spinner.fail('Validation error occurred')
      Logger.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

validateCommand
  .command('registry')
  .description('Validate registry.yaml file')
  .argument('[path]', 'Registry file path', 'registry.yaml')
  .option('-r, --repo-root <path>', 'Repository root path', process.cwd())
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .option('-s, --severity <level>', 'Minimum severity level (fatal|error|warning|info)', 'error')
  .action((registryPath: string, options: { repoRoot: string; format: OutputFormat; severity: string }) => {
    const spinner = ora('Validating registry...').start()

    try {
      const resolvedRegistryPath = path.resolve(options.repoRoot, registryPath)
      const resolvedRepoRoot = path.resolve(options.repoRoot)

      if (!fs.existsSync(resolvedRegistryPath)) {
        spinner.fail(`Registry file does not exist: ${resolvedRegistryPath}`)
        process.exit(1)
      }

      const result = validateRegistry(resolvedRegistryPath, resolvedRepoRoot)

      if (result.success) {
        spinner.succeed('Registry validation passed!')
        if (options.format === 'json') {
          writeOutput({ success: true, data: result.data }, options)
        } else {
          Logger.success('Registry is valid!')
        }
        process.exit(0)
      } else {
        spinner.fail('Registry validation failed!')
        const severity = options.severity as Severity
        const filteredErrors = filterBySeverity(result.errors || [], severity)
        const shouldExit = hasFatalErrors(filteredErrors)
        
        if (options.format === 'json') {
          writeOutput({ success: false, errors: formatValidationErrorsJson(filteredErrors) }, options)
        } else {
          Logger.error('Registry validation failed:')
          // eslint-disable-next-line no-console
          console.log(formatValidationErrors(filteredErrors))
        }
        process.exit(shouldExit ? 1 : 0)
      }
    } catch (error) {
      spinner.fail('Validation error occurred')
      Logger.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

validateCommand
  .command('file')
  .description('Validate a single prompt file')
  .argument('<file-path>', 'Path to prompt YAML file')
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .option('-s, --severity <level>', 'Minimum severity level (fatal|error|warning|info)', 'error')
  .action((filePath: string, options: { format: OutputFormat; severity: string }) => {
    const spinner = ora('Validating prompt file...').start()

    try {
      const resolvedPath = path.resolve(filePath)

      if (!fs.existsSync(resolvedPath)) {
        spinner.fail(`File does not exist: ${resolvedPath}`)
        process.exit(1)
      }

      const result = validatePromptFile(resolvedPath)

      if (result.success) {
        spinner.succeed('Prompt file validation passed!')
        if (options.format === 'json') {
          writeOutput({ success: true, data: result.data }, options)
        } else {
          Logger.success('Prompt file is valid!')
        }
        process.exit(0)
      } else {
        spinner.fail('Prompt file validation failed!')
        const severity = options.severity as Severity
        const filteredErrors = filterBySeverity(result.errors || [], severity)
        const shouldExit = hasFatalErrors(filteredErrors)
        
        if (options.format === 'json') {
          writeOutput({ success: false, errors: formatValidationErrorsJson(filteredErrors) }, options)
        } else {
          Logger.error('Prompt file validation failed:')
          // eslint-disable-next-line no-console
          console.log(formatValidationErrors(filteredErrors))
        }
        process.exit(shouldExit ? 1 : 0)
      }
    } catch (error) {
      spinner.fail('Validation error occurred')
      Logger.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

validateCommand
  .command('partials')
  .description('Validate partials directory')
  .argument('[path]', 'Repository root path', process.cwd())
  .option('-p, --partials-path <path>', 'Partials directory path relative to repo root', 'partials')
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .option('-s, --severity <level>', 'Minimum severity level (fatal|error|warning|info)', 'error')
  .action((repoPath: string, options: { partialsPath: string; format: OutputFormat; severity: string }) => {
    const spinner = ora('Validating partials...').start()

    try {
      const resolvedPath = path.resolve(repoPath)

      if (!fs.existsSync(resolvedPath)) {
        spinner.fail(`Repository path does not exist: ${resolvedPath}`)
        process.exit(1)
      }

      const result = validatePartials(resolvedPath, options.partialsPath)

      if (!result.success) {
        spinner.fail('Partials validation failed!')
        const severity = options.severity as Severity
        const filteredErrors = filterBySeverity(result.errors || [], severity)
        const shouldExit = hasFatalErrors(filteredErrors)
        
        if (options.format === 'json') {
          writeOutput({ success: false, errors: formatValidationErrorsJson(filteredErrors) }, options)
        } else {
          // eslint-disable-next-line no-console
          console.log(formatValidationErrors(filteredErrors))
        }
        process.exit(shouldExit ? 1 : 0)
      }

      spinner.succeed(`Found ${result.partials?.length || 0} partial file(s)!`)
      if (options.format === 'json') {
        writeOutput({ partials: result.partials, count: result.partials?.length || 0 }, options)
      } else {
        Logger.success(`Found ${result.partials?.length || 0} partial file(s):`)
        result.partials?.forEach(p => {
          // eslint-disable-next-line no-console
          console.log(`  - ${p}`)
        })
      }
      process.exit(0)
    } catch (error) {
      spinner.fail('Validation error occurred')
      Logger.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

