/**
 * TypeScript Example: Validate a Prompt Repository
 * 
 * This example demonstrates how to use the programmatic API
 * with full TypeScript type safety.
 */

import { validatePromptRepo, type ToolkitError } from '@carllee1983/prompt-toolkit'

/**
 * Validate a repository and handle errors with type safety
 */
function validateRepository(repoPath: string): void {
  const result = validatePromptRepo(repoPath)

  if (result.passed) {
    console.log('✅ Repository validation passed!')
    console.log('Summary:', result.summary)
    return
  }

  console.error('❌ Repository validation failed!')
  console.error(`Found ${result.errors.length} error(s)`)
  
  // TypeScript knows the structure of errors
  displayErrors(result.errors)
  displaySummary(result.summary)
  
  // Exit with appropriate code
  if (result.summary.fatal > 0) {
    process.exit(1)
  } else if (result.summary.error > 0) {
    process.exit(1)
  }
}

/**
 * Display errors grouped by severity with type safety
 */
function displayErrors(errors: ToolkitError[]): void {
  const fatalErrors = errors.filter(e => e.severity === 'fatal')
  const errorErrors = errors.filter(e => e.severity === 'error')
  const warnings = errors.filter(e => e.severity === 'warning')
  const info = errors.filter(e => e.severity === 'info')
  
  if (fatalErrors.length > 0) {
    console.error('\n🔴 Fatal Errors:')
    fatalErrors.forEach(err => {
      console.error(`  - ${err.code}: ${err.message}`)
      if (err.hint) {
        console.error(`    Hint: ${err.hint}`)
      }
      if (err.file) {
        console.error(`    File: ${err.file}`)
      }
    })
  }
  
  if (errorErrors.length > 0) {
    console.error('\n❌ Errors:')
    errorErrors.forEach(err => {
      console.error(`  - ${err.code}: ${err.message}`)
      if (err.file) {
        console.error(`    File: ${err.file}`)
      }
    })
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    warnings.forEach(err => {
      console.warn(`  - ${err.code}: ${err.message}`)
    })
  }
  
  if (info.length > 0) {
    console.info('\nℹ️  Info:')
    info.forEach(err => {
      console.info(`  - ${err.code}: ${err.message}`)
    })
  }
}

/**
 * Display validation summary with type safety
 */
function displaySummary(summary: {
  fatal: number
  error: number
  warning: number
  info: number
}): void {
  console.log('\n📊 Summary:')
  console.log(`  Fatal: ${summary.fatal}`)
  console.log(`  Errors: ${summary.error}`)
  console.log(`  Warnings: ${summary.warning}`)
  console.log(`  Info: ${summary.info}`)
}

// Example usage
const repoPath = process.argv[2] || './prompts'
validateRepository(repoPath)

