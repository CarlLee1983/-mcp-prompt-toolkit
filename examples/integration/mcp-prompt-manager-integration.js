/**
 * Integration Example: MCP Prompt Manager
 * 
 * This example demonstrates how to integrate prompt-toolkit
 * with MCP Prompt Manager to validate prompts before loading.
 */

import { validatePromptRepo, ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Simulated MCP Prompt Manager loader
 * In real implementation, this would be the actual MCP Prompt Manager
 */
class MockMCPPromptManager {
  constructor(repoPath) {
    this.repoPath = repoPath
    this.loadedPrompts = []
    this.loadErrors = []
  }

  /**
   * Load prompts from repository
   */
  async loadPrompts() {
    // In real implementation, this would load prompts from the repository
    console.log(`Loading prompts from: ${this.repoPath}`)
    // Simulate loading
    return this.loadedPrompts
  }

  /**
   * Get loaded prompts
   */
  getPrompts() {
    return this.loadedPrompts
  }

  /**
   * Get load errors
   */
  getErrors() {
    return this.loadErrors
  }
}

/**
 * Validate repository before loading into MCP Prompt Manager
 */
async function loadValidatedPrompts(repoPath, options = {}) {
  const {
    failOnWarnings = false,
    logResults = true,
    saveValidationReport = false
  } = options

  // Step 1: Validate repository
  if (logResults) {
    console.log('🔍 Validating prompt repository...')
  }

  const validation = validatePromptRepo(repoPath, {
    minSeverity: failOnWarnings ? 'warning' : 'error'
  })

  // Step 2: Check validation results
  if (!validation.passed) {
    const fatalErrors = validation.errors.filter(
      e => e.severity === 'fatal'
    )
    const errors = validation.errors.filter(
      e => e.severity === 'error'
    )
    const warnings = validation.errors.filter(
      e => e.severity === 'warning'
    )

    if (logResults) {
      console.error('❌ Repository validation failed!')
      
      if (fatalErrors.length > 0) {
        console.error(`\n🔴 ${fatalErrors.length} fatal error(s):`)
        fatalErrors.forEach(err => {
          console.error(`  - ${err.code}: ${err.message}`)
          if (err.hint) {
            console.error(`    💡 ${err.hint}`)
          }
        })
      }

      if (errors.length > 0) {
        console.error(`\n❌ ${errors.length} error(s):`)
        errors.forEach(err => {
          console.error(`  - ${err.code}: ${err.message}`)
          if (err.file) {
            console.error(`    📄 ${err.file}`)
          }
        })
      }

      if (warnings.length > 0) {
        console.warn(`\n⚠️  ${warnings.length} warning(s):`)
        warnings.forEach(err => {
          console.warn(`  - ${err.code}: ${err.message}`)
        })
      }
    }

    // Save validation report if requested
    if (saveValidationReport) {
      const reportPath = join(repoPath, 'validation-report.json')
      writeFileSync(
        reportPath,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          passed: false,
          errors: validation.errors,
          summary: validation.summary
        }, null, 2)
      )
      console.log(`\n📄 Validation report saved to: ${reportPath}`)
    }

    // Check if we should fail
    const shouldFail = validation.summary.fatal > 0 || 
                       validation.summary.error > 0 ||
                       (failOnWarnings && validation.summary.warning > 0)

    if (shouldFail) {
      throw new Error(
        `Repository validation failed: ${validation.summary.fatal} fatal, ` +
        `${validation.summary.error} errors, ${validation.summary.warning} warnings`
      )
    }
  }

  // Step 3: Load prompts into MCP Prompt Manager
  if (logResults) {
    console.log('✅ Validation passed! Loading prompts into MCP Prompt Manager...')
  }

  const mcpManager = new MockMCPPromptManager(repoPath)
  const prompts = await mcpManager.loadPrompts()

  if (logResults) {
    console.log(`✅ Successfully loaded ${prompts.length} prompt(s)`)
    console.log('\n📊 Validation Summary:')
    console.log(`  Fatal: ${validation.summary.fatal}`)
    console.log(`  Errors: ${validation.summary.error}`)
    console.log(`  Warnings: ${validation.summary.warning}`)
    console.log(`  Info: ${validation.summary.info}`)
  }

  return {
    prompts,
    validation,
    mcpManager
  }
}

/**
 * Pre-deployment validation
 * Validate repository before deploying to production
 */
async function preDeploymentValidation(repoPath) {
  console.log('🚀 Pre-deployment validation...\n')

  try {
    const result = await loadValidatedPrompts(repoPath, {
      failOnWarnings: true, // Fail on warnings in production
      logResults: true,
      saveValidationReport: true
    })

    console.log('\n✅ Pre-deployment validation passed!')
    console.log(`Ready to deploy ${result.prompts.length} prompt(s)`)
    
    return true
  } catch (error) {
    console.error('\n❌ Pre-deployment validation failed!')
    console.error(error.message)
    console.error('\nPlease fix validation errors before deploying.')
    
    return false
  }
}

/**
 * Development validation
 * Validate during development with relaxed rules
 */
async function developmentValidation(repoPath) {
  console.log('💻 Development validation...\n')

  try {
    const result = await loadValidatedPrompts(repoPath, {
      failOnWarnings: false, // Allow warnings in development
      logResults: true,
      saveValidationReport: false
    })

    if (result.validation.summary.warning > 0) {
      console.warn('\n⚠️  Warnings found, but continuing in development mode')
    }

    return true
  } catch (error) {
    console.error('\n❌ Development validation failed!')
    console.error(error.message)
    
    return false
  }
}

// Example usage
async function main() {
  const repoPath = process.argv[2] || './prompts'
  const mode = process.argv[3] || 'development' // 'development' or 'production'

  if (mode === 'production') {
    const success = await preDeploymentValidation(repoPath)
    process.exit(success ? 0 : 1)
  } else {
    const success = await developmentValidation(repoPath)
    process.exit(success ? 0 : 1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { loadValidatedPrompts, preDeploymentValidation, developmentValidation }

