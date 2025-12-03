import chalk from 'chalk'
import type { ToolkitError } from '../../types/errors'

function getSeverityColor(severity: ToolkitError['severity']) {
  switch (severity) {
    case 'fatal':
      return chalk.bgRed.white
    case 'error':
      return chalk.red
    case 'warning':
      return chalk.yellow
    case 'info':
      return chalk.blue
    default:
      return chalk.red
  }
}

function getSeverityLabel(severity: ToolkitError['severity']): string {
  return severity.toUpperCase()
}

export function formatValidationErrors(errors: ToolkitError[]): string {
  if (errors.length === 0) {
    return chalk.green('No validation errors found.')
  }

  const lines: string[] = []
  const fatalCount = errors.filter(e => e.severity === 'fatal').length
  const errorCount = errors.filter(e => e.severity === 'error').length
  const warningCount = errors.filter(e => e.severity === 'warning').length
  const infoCount = errors.filter(e => e.severity === 'info').length

  const counts: string[] = []
  if (fatalCount > 0) counts.push(chalk.bgRed.white(`${fatalCount} fatal(s)`))
  if (errorCount > 0) counts.push(chalk.red(`${errorCount} error(s)`))
  if (warningCount > 0) counts.push(chalk.yellow(`${warningCount} warning(s)`))
  if (infoCount > 0) counts.push(chalk.blue(`${infoCount} info(s)`))

  lines.push(`Found ${errors.length} validation issue(s): ${counts.join(', ')}\n`)

  // Group errors by file
  const errorsByFile = new Map<string, ToolkitError[]>()
  for (const error of errors) {
    const file = error.file || 'unknown'
    if (!errorsByFile.has(file)) {
      errorsByFile.set(file, [])
    }
    errorsByFile.get(file)!.push(error)
  }

  for (const [file, fileErrors] of errorsByFile.entries()) {
    lines.push(chalk.bold(`File: ${file}`))

    for (const error of fileErrors) {
      const color = getSeverityColor(error.severity)
      const label = getSeverityLabel(error.severity)
      lines.push(color(`  [${label}] ${error.code}: ${error.message}`))
      
      if (error.hint) {
        lines.push(chalk.gray(`    Hint: ${error.hint}`))
      }
      
      if (error.meta) {
        for (const [key, value] of Object.entries(error.meta)) {
          if (key === 'chain' && Array.isArray(value)) {
            lines.push(`    Chain: ${value.join(' → ')}`)
          } else if (key === 'partial') {
            lines.push(`    Partial: ${value}`)
          } else if (key === 'path' && Array.isArray(value)) {
            lines.push(`    Path: ${value.join('.')}`)
          } else if (typeof value === 'string' || typeof value === 'number') {
            lines.push(`    ${key}: ${value}`)
          }
        }
      }
    }

    lines.push('')
  }

  return lines.join('\n')
}

export function formatValidationErrorsJson(errors: ToolkitError[]): object {
  return {
    errors: errors.map(error => ({
      code: error.code,
      severity: error.severity,
      message: error.message,
      file: error.file,
      hint: error.hint,
      meta: error.meta
    }))
  }
}

