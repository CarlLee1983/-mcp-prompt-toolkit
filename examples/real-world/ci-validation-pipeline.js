/**
 * Real-World Example: CI Validation Pipeline
 * 
 * This example demonstrates a complete CI validation pipeline
 * that validates prompts, generates reports, and handles errors.
 */

import { validatePromptRepo, ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

/**
 * CI Validation Pipeline
 */
class CIValidationPipeline {
  constructor(repoPath, outputDir = './ci-reports') {
    this.repoPath = repoPath
    this.outputDir = outputDir
    this.results = {
      timestamp: new Date().toISOString(),
      repo: repoPath,
      validation: null,
      reports: [],
      summary: {
        passed: false,
        fatal: 0,
        error: 0,
        warning: 0,
        info: 0
      }
    }
  }

  /**
   * Run complete validation pipeline
   */
  async run() {
    console.log('🚀 Starting CI Validation Pipeline...\n')

    // Step 1: Setup output directory
    this.setupOutputDirectory()

    // Step 2: Validate repository
    await this.validateRepository()

    // Step 3: Generate reports
    this.generateReports()

    // Step 4: Check thresholds
    const passed = this.checkThresholds()

    // Step 5: Save results
    this.saveResults()

    // Step 6: Exit with appropriate code
    this.exit(passed)

    return this.results
  }

  /**
   * Setup output directory
   */
  setupOutputDirectory() {
    try {
      mkdirSync(this.outputDir, { recursive: true })
      console.log(`📁 Output directory: ${this.outputDir}`)
    } catch (error) {
      console.error(`❌ Failed to create output directory: ${error.message}`)
      throw error
    }
  }

  /**
   * Validate repository
   */
  async validateRepository() {
    console.log('🔍 Validating repository...')

    const validation = validatePromptRepo(this.repoPath, {
      minSeverity: 'info' // Get all issues for comprehensive reporting
    })

    this.results.validation = validation
    this.results.summary = {
      passed: validation.passed,
      fatal: validation.summary.fatal,
      error: validation.summary.error,
      warning: validation.summary.warning,
      info: validation.summary.info
    }

    if (validation.passed) {
      console.log('✅ Repository validation passed!')
    } else {
      console.log('❌ Repository validation failed!')
      console.log(`   Fatal: ${validation.summary.fatal}`)
      console.log(`   Errors: ${validation.summary.error}`)
      console.log(`   Warnings: ${validation.summary.warning}`)
      console.log(`   Info: ${validation.summary.info}`)
    }

    return validation
  }

  /**
   * Generate various reports
   */
  generateReports() {
    console.log('\n📊 Generating reports...')

    // JSON report
    this.generateJSONReport()

    // Error summary report
    this.generateErrorSummaryReport()

    // Severity-based reports
    this.generateSeverityReports()

    // Error code distribution
    this.generateErrorCodeDistribution()

    console.log(`✅ Generated ${this.results.reports.length} report(s)`)
  }

  /**
   * Generate JSON report
   */
  generateJSONReport() {
    const reportPath = join(this.outputDir, 'validation-results.json')
    writeFileSync(
      reportPath,
      JSON.stringify(this.results, null, 2)
    )
    this.results.reports.push({
      type: 'json',
      path: reportPath,
      description: 'Complete validation results in JSON format'
    })
    console.log(`  ✓ JSON report: ${reportPath}`)
  }

  /**
   * Generate error summary report
   */
  generateErrorSummaryReport() {
    const errors = this.results.validation.errors
    const summary = {
      total: errors.length,
      bySeverity: {
        fatal: errors.filter(e => e.severity === 'fatal').length,
        error: errors.filter(e => e.severity === 'error').length,
        warning: errors.filter(e => e.severity === 'warning').length,
        info: errors.filter(e => e.severity === 'info').length
      },
      byCode: {},
      byFile: {}
    }

    // Count by error code
    errors.forEach(err => {
      summary.byCode[err.code] = (summary.byCode[err.code] || 0) + 1
    })

    // Count by file
    errors.forEach(err => {
      if (err.file) {
        summary.byFile[err.file] = (summary.byFile[err.file] || 0) + 1
      }
    })

    const reportPath = join(this.outputDir, 'error-summary.json')
    writeFileSync(
      reportPath,
      JSON.stringify(summary, null, 2)
    )
    this.results.reports.push({
      type: 'error-summary',
      path: reportPath,
      description: 'Error summary by severity, code, and file'
    })
    console.log(`  ✓ Error summary: ${reportPath}`)
  }

  /**
   * Generate severity-based reports
   */
  generateSeverityReports() {
    const severities = ['fatal', 'error', 'warning', 'info']

    severities.forEach(severity => {
      const errors = this.results.validation.errors.filter(
        e => e.severity === severity
      )

      if (errors.length > 0) {
        const reportPath = join(this.outputDir, `${severity}-errors.json`)
        writeFileSync(
          reportPath,
          JSON.stringify(errors, null, 2)
        )
        this.results.reports.push({
          type: `${severity}-errors`,
          path: reportPath,
          description: `${severity} level errors`,
          count: errors.length
        })
        console.log(`  ✓ ${severity} errors: ${reportPath} (${errors.length})`)
      }
    })
  }

  /**
   * Generate error code distribution
   */
  generateErrorCodeDistribution() {
    const distribution = {}
    
    this.results.validation.errors.forEach(err => {
      if (!distribution[err.code]) {
        distribution[err.code] = {
          count: 0,
          severity: err.severity,
          examples: []
        }
      }
      distribution[err.code].count++
      if (distribution[err.code].examples.length < 3) {
        distribution[err.code].examples.push({
          message: err.message,
          file: err.file
        })
      }
    })

    const reportPath = join(this.outputDir, 'error-code-distribution.json')
    writeFileSync(
      reportPath,
      JSON.stringify(distribution, null, 2)
    )
    this.results.reports.push({
      type: 'error-code-distribution',
      path: reportPath,
      description: 'Error code distribution and examples'
    })
    console.log(`  ✓ Error code distribution: ${reportPath}`)
  }

  /**
   * Check if validation passes thresholds
   */
  checkThresholds() {
    const thresholds = {
      fatal: 0,    // No fatal errors allowed
      error: 0,    // No errors allowed in CI
      warning: 100 // Allow up to 100 warnings
    }

    const passed = 
      this.results.summary.fatal <= thresholds.fatal &&
      this.results.summary.error <= thresholds.error &&
      this.results.summary.warning <= thresholds.warning

    console.log('\n📏 Threshold Check:')
    console.log(`  Fatal: ${this.results.summary.fatal} / ${thresholds.fatal} (${this.results.summary.fatal <= thresholds.fatal ? '✅' : '❌'})`)
    console.log(`  Errors: ${this.results.summary.error} / ${thresholds.error} (${this.results.summary.error <= thresholds.error ? '✅' : '❌'})`)
    console.log(`  Warnings: ${this.results.summary.warning} / ${thresholds.warning} (${this.results.summary.warning <= thresholds.warning ? '✅' : '❌'})`)

    return passed
  }

  /**
   * Save final results
   */
  saveResults() {
    const resultsPath = join(this.outputDir, 'pipeline-results.json')
    writeFileSync(
      resultsPath,
      JSON.stringify(this.results, null, 2)
    )
    console.log(`\n💾 Pipeline results saved: ${resultsPath}`)
  }

  /**
   * Exit with appropriate code
   */
  exit(passed) {
    if (passed) {
      console.log('\n✅ CI Validation Pipeline: PASSED')
      process.exit(0)
    } else {
      console.log('\n❌ CI Validation Pipeline: FAILED')
      console.log('\n📋 Next Steps:')
      console.log('  1. Review error reports in:', this.outputDir)
      console.log('  2. Fix validation errors')
      console.log('  3. Re-run validation')
      process.exit(1)
    }
  }
}

// Example usage
async function main() {
  const repoPath = process.argv[2] || './prompts'
  const outputDir = process.argv[3] || './ci-reports'

  const pipeline = new CIValidationPipeline(repoPath, outputDir)
  await pipeline.run()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { CIValidationPipeline }

