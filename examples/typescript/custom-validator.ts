/**
 * TypeScript Example: Custom Validator
 * 
 * This example demonstrates how to create a custom validator
 * that extends the toolkit's validation with business-specific rules.
 */

import {
  validatePromptRepo,
  validatePromptFile,
  ERROR_CODE_CONSTANTS,
  type ToolkitError,
  type Severity
} from '@carllee1983/prompt-toolkit'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

/**
 * Custom validation result with additional business rules
 */
interface CustomValidationResult {
  passed: boolean
  errors: ToolkitError[]
  summary: {
    fatal: number
    error: number
    warning: number
    info: number
  }
  customErrors: ToolkitError[]
}

/**
 * Custom business rules for prompt validation
 */
interface BusinessRules {
  requireDescription: boolean
  minDescriptionLength: number
  requireArgs: boolean
  maxPromptFileSize: number // in bytes
}

/**
 * Create a custom error with type safety
 */
function createCustomError(
  code: string,
  message: string,
  severity: Severity,
  file?: string,
  hint?: string,
  meta?: Record<string, unknown>
): ToolkitError {
  return {
    code,
    severity,
    message,
    file,
    hint,
    meta
  }
}

/**
 * Validate prompt file size
 */
async function validateFileSize(
  filePath: string,
  maxSize: number
): Promise<ToolkitError | null> {
  try {
    const stats = await stat(filePath)
    if (stats.size > maxSize) {
      return createCustomError(
        'CUSTOM_FILE_TOO_LARGE',
        `File size (${stats.size} bytes) exceeds maximum (${maxSize} bytes)`,
        'warning',
        filePath,
        'Consider splitting the prompt into smaller files',
        { size: stats.size, maxSize }
      )
    }
    return null
  } catch (error) {
    return createCustomError(
      'CUSTOM_FILE_STAT_FAILED',
      `Failed to get file stats: ${error instanceof Error ? error.message : String(error)}`,
      'error',
      filePath
    )
  }
}

/**
 * Validate prompt description
 */
function validateDescription(
  promptData: { description?: string },
  filePath: string,
  rules: BusinessRules
): ToolkitError[] {
  const errors: ToolkitError[] = []

  if (rules.requireDescription && !promptData.description) {
    errors.push(
      createCustomError(
        'CUSTOM_NO_DESCRIPTION',
        'Prompt must have a description',
        'error',
        filePath,
        'Add a description field to the prompt',
        { field: 'description' }
      )
    )
  }

  if (
    promptData.description &&
    promptData.description.length < rules.minDescriptionLength
  ) {
    errors.push(
      createCustomError(
        'CUSTOM_DESCRIPTION_TOO_SHORT',
        `Description must be at least ${rules.minDescriptionLength} characters`,
        'warning',
        filePath,
        `Current length: ${promptData.description.length}`,
        {
          length: promptData.description.length,
          minLength: rules.minDescriptionLength
        }
      )
    )
  }

  return errors
}

/**
 * Validate prompt arguments
 */
function validateArgs(
  promptData: { args?: Record<string, unknown> },
  filePath: string,
  rules: BusinessRules
): ToolkitError[] {
  const errors: ToolkitError[] = []

  if (rules.requireArgs && (!promptData.args || Object.keys(promptData.args).length === 0)) {
    errors.push(
      createCustomError(
        'CUSTOM_NO_ARGS',
        'Prompt must have at least one argument',
        'warning',
        filePath,
        'Add an args field with at least one parameter',
        { field: 'args' }
      )
    )
  }

  return errors
}

/**
 * Custom validator with business rules
 */
async function customValidate(
  repoPath: string,
  rules: BusinessRules = {
    requireDescription: true,
    minDescriptionLength: 50,
    requireArgs: false,
    maxPromptFileSize: 100 * 1024 // 100KB
  }
): Promise<CustomValidationResult> {
  // First, run standard validation
  const standardResult = validatePromptRepo(repoPath)

  const customErrors: ToolkitError[] = []

  // Apply custom business rules
  if (standardResult.passed || standardResult.summary.fatal === 0) {
    // Only apply custom rules if standard validation passed or no fatal errors
    try {
      const files = await readdir(repoPath, { recursive: true, withFileTypes: true })
      
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.yaml')) {
          const filePath = join(file.path, file.name)
          
          // Validate file size
          const sizeError = await validateFileSize(filePath, rules.maxPromptFileSize)
          if (sizeError) {
            customErrors.push(sizeError)
          }

          // Validate prompt content
          const promptResult = validatePromptFile(filePath)
          if (promptResult.success) {
            // Validate description
            const descErrors = validateDescription(promptResult.data, filePath, rules)
            customErrors.push(...descErrors)

            // Validate args
            const argsErrors = validateArgs(promptResult.data, filePath, rules)
            customErrors.push(...argsErrors)
          }
        }
      }
    } catch (error) {
      customErrors.push(
        createCustomError(
          'CUSTOM_VALIDATION_FAILED',
          `Custom validation failed: ${error instanceof Error ? error.message : String(error)}`,
          'error',
          repoPath
        )
      )
    }
  }

  // Combine standard and custom errors
  const allErrors = [...standardResult.errors, ...customErrors]

  // Calculate summary
  const summary = {
    fatal: allErrors.filter(e => e.severity === 'fatal').length,
    error: allErrors.filter(e => e.severity === 'error').length,
    warning: allErrors.filter(e => e.severity === 'warning').length,
    info: allErrors.filter(e => e.severity === 'info').length
  }

  return {
    passed: summary.fatal === 0 && summary.error === 0,
    errors: allErrors,
    summary,
    customErrors
  }
}

// Example usage
async function main() {
  const repoPath = process.argv[2] || './prompts'
  
  const rules: BusinessRules = {
    requireDescription: true,
    minDescriptionLength: 50,
    requireArgs: false,
    maxPromptFileSize: 100 * 1024
  }

  const result = await customValidate(repoPath, rules)

  if (result.passed) {
    console.log('✅ Validation passed (including custom rules)!')
  } else {
    console.error('❌ Validation failed!')
    
    if (result.customErrors.length > 0) {
      console.error('\n🔧 Custom Validation Errors:')
      result.customErrors.forEach(err => {
        console.error(`  [${err.severity.toUpperCase()}] ${err.code}: ${err.message}`)
        if (err.file) {
          console.error(`    File: ${err.file}`)
        }
        if (err.hint) {
          console.error(`    Hint: ${err.hint}`)
        }
      })
    }
  }

  console.log('\n📊 Summary:')
  console.log(`  Fatal: ${result.summary.fatal}`)
  console.log(`  Errors: ${result.summary.error}`)
  console.log(`  Warnings: ${result.summary.warning}`)
  console.log(`  Info: ${result.summary.info}`)
  console.log(`  Custom Errors: ${result.customErrors.length}`)
}

if (require.main === module) {
  main().catch(console.error)
}

export { customValidate, type CustomValidationResult, type BusinessRules }

