/**
 * Real-World Example: Batch Validation
 * 
 * This example demonstrates how to validate multiple prompt repositories
 * in batch and generate a consolidated report.
 */

import { validatePromptRepo } from '@carllee1983/prompt-toolkit'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { writeFileSync } from 'fs'

/**
 * Batch validation results
 */
class BatchValidationResults {
  constructor() {
    this.repositories = []
    this.summary = {
      total: 0,
      passed: 0,
      failed: 0,
      totalErrors: {
        fatal: 0,
        error: 0,
        warning: 0,
        info: 0
      }
    }
    this.startTime = Date.now()
  }

  /**
   * Add repository validation result
   */
  addRepository(name, path, result) {
    this.repositories.push({
      name,
      path,
      passed: result.passed,
      summary: result.summary,
      errorCount: result.errors.length,
      timestamp: new Date().toISOString()
    })

    this.summary.total++
    if (result.passed) {
      this.summary.passed++
    } else {
      this.summary.failed++
    }

    // Aggregate error counts
    this.summary.totalErrors.fatal += result.summary.fatal
    this.summary.totalErrors.error += result.summary.error
    this.summary.totalErrors.warning += result.summary.warning
    this.summary.totalErrors.info += result.summary.info
  }

  /**
   * Get execution time
   */
  getExecutionTime() {
    return Date.now() - this.startTime
  }

  /**
   * Generate consolidated report
   */
  generateReport() {
    return {
      summary: {
        ...this.summary,
        executionTimeMs: this.getExecutionTime(),
        executionTime: `${(this.getExecutionTime() / 1000).toFixed(2)}s`
      },
      repositories: this.repositories,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Check if path is a directory
 */
async function isDirectory(path) {
  try {
    const stats = await stat(path)
    return stats.isDirectory()
  } catch {
    return false
  }
}

/**
 * Find all prompt repositories in a directory
 */
async function findRepositories(basePath) {
  const repositories = []
  
  try {
    const entries = await readdir(basePath, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const repoPath = join(basePath, entry.name)
        
        // Check if it looks like a prompt repository
        // (has registry.yaml or prompts directory)
        const hasRegistry = await isDirectory(join(repoPath, 'registry.yaml')) || 
                           await isDirectory(join(repoPath, 'registry.yml'))
        
        if (hasRegistry) {
          repositories.push({
            name: entry.name,
            path: repoPath
          })
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${basePath}:`, error.message)
  }
  
  return repositories
}

/**
 * Validate a single repository
 */
async function validateRepository(name, path, options = {}) {
  const {
    minSeverity = 'error',
    verbose = false
  } = options

  if (verbose) {
    console.log(`\n🔍 Validating: ${name} (${path})`)
  }

  try {
    const result = validatePromptRepo(path, { minSeverity })

    if (verbose) {
      if (result.passed) {
        console.log(`  ✅ ${name}: Passed`)
      } else {
        console.log(`  ❌ ${name}: Failed`)
        console.log(`     Fatal: ${result.summary.fatal}, Errors: ${result.summary.error}, Warnings: ${result.summary.warning}`)
      }
    }

    return result
  } catch (error) {
    if (verbose) {
      console.error(`  ❌ ${name}: Error - ${error.message}`)
    }
    
    // Return a failed result
    return {
      passed: false,
      errors: [{
        code: 'BATCH_VALIDATION_ERROR',
        severity: 'fatal',
        message: `Failed to validate repository: ${error.message}`,
        file: path
      }],
      summary: {
        fatal: 1,
        error: 0,
        warning: 0,
        info: 0
      }
    }
  }
}

/**
 * Validate multiple repositories in batch
 */
async function batchValidate(basePath, options = {}) {
  const {
    minSeverity = 'error',
    verbose = true,
    outputFile = null,
    parallel = false,
    maxConcurrent = 5
  } = options

  console.log(`🚀 Starting batch validation...`)
  console.log(`   Base path: ${basePath}`)
  console.log(`   Min severity: ${minSeverity}`)
  console.log(`   Parallel: ${parallel}`)

  // Find all repositories
  console.log('\n📁 Discovering repositories...')
  const repositories = await findRepositories(basePath)
  
  if (repositories.length === 0) {
    console.log('❌ No repositories found!')
    return null
  }

  console.log(`✅ Found ${repositories.length} repository(ies)\n`)

  const results = new BatchValidationResults()

  // Validate repositories
  if (parallel) {
    // Parallel validation with concurrency limit
    const chunks = []
    for (let i = 0; i < repositories.length; i += maxConcurrent) {
      chunks.push(repositories.slice(i, i + maxConcurrent))
    }

    for (const chunk of chunks) {
      const promises = chunk.map(repo =>
        validateRepository(repo.name, repo.path, { minSeverity, verbose })
          .then(result => ({ repo, result }))
      )
      
      const chunkResults = await Promise.all(promises)
      
      for (const { repo, result } of chunkResults) {
        results.addRepository(repo.name, repo.path, result)
      }
    }
  } else {
    // Sequential validation
    for (const repo of repositories) {
      const result = await validateRepository(repo.name, repo.path, { minSeverity, verbose })
      results.addRepository(repo.name, repo.path, result)
    }
  }

  // Generate and display summary
  const report = results.generateReport()
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Batch Validation Summary')
  console.log('='.repeat(60))
  console.log(`Total Repositories: ${report.summary.total}`)
  console.log(`✅ Passed: ${report.summary.passed}`)
  console.log(`❌ Failed: ${report.summary.failed}`)
  console.log(`\nTotal Errors:`)
  console.log(`  Fatal: ${report.summary.totalErrors.fatal}`)
  console.log(`  Errors: ${report.summary.totalErrors.error}`)
  console.log(`  Warnings: ${report.summary.totalErrors.warning}`)
  console.log(`  Info: ${report.summary.totalErrors.info}`)
  console.log(`\nExecution Time: ${report.summary.executionTime}`)
  console.log('='.repeat(60))

  // Show failed repositories
  const failed = report.repositories.filter(r => !r.passed)
  if (failed.length > 0) {
    console.log('\n❌ Failed Repositories:')
    failed.forEach(repo => {
      console.log(`  - ${repo.name}`)
      console.log(`    Fatal: ${repo.summary.fatal}, Errors: ${repo.summary.error}, Warnings: ${repo.summary.warning}`)
    })
  }

  // Save report if requested
  if (outputFile) {
    writeFileSync(outputFile, JSON.stringify(report, null, 2))
    console.log(`\n💾 Report saved to: ${outputFile}`)
  }

  return report
}

// Example usage
async function main() {
  const basePath = process.argv[2] || './repositories'
  const outputFile = process.argv[3] || './batch-validation-report.json'
  const parallel = process.argv[4] === '--parallel'

  const report = await batchValidate(basePath, {
    minSeverity: 'error',
    verbose: true,
    outputFile,
    parallel,
    maxConcurrent: 5
  })

  if (report && report.summary.failed > 0) {
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { batchValidate, BatchValidationResults }

