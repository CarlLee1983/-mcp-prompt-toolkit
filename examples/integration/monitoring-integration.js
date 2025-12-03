/**
 * Integration Example: Monitoring System
 * 
 * This example demonstrates how to integrate prompt-toolkit
 * with monitoring systems to track repository health.
 */

import { validatePromptRepo, ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'
import { writeFileSync, appendFileSync } from 'fs'
import { join } from 'path'

/**
 * Mock monitoring service
 * In real implementation, this would be your actual monitoring service
 * (e.g., Datadog, New Relic, Prometheus, etc.)
 */
class MonitoringService {
  constructor() {
    this.metrics = []
    this.alerts = []
  }

  /**
   * Send metric to monitoring system
   */
  sendMetric(name, value, tags = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: new Date().toISOString()
    }
    this.metrics.push(metric)
    console.log(`📊 Metric: ${name} = ${value}`, tags)
    // In real implementation: send to monitoring API
  }

  /**
   * Send alert to monitoring system
   */
  sendAlert(level, message, metadata = {}) {
    const alert = {
      level, // 'critical', 'warning', 'info'
      message,
      metadata,
      timestamp: new Date().toISOString()
    }
    this.alerts.push(alert)
    
    const emoji = {
      critical: '🔴',
      warning: '⚠️',
      info: 'ℹ️'
    }[level] || '📢'
    
    console.log(`${emoji} Alert [${level.toUpperCase()}]: ${message}`)
    // In real implementation: send to alerting system
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return this.metrics
  }

  /**
   * Get all alerts
   */
  getAlerts() {
    return this.alerts
  }
}

/**
 * Monitor repository health
 */
async function monitorRepository(repoPath, options = {}) {
  const {
    monitoringService = new MonitoringService(),
    logResults = true,
    saveMetrics = false,
    alertThresholds = {
      fatal: 0,      // Alert on any fatal error
      error: 10,     // Alert if more than 10 errors
      warning: 50    // Alert if more than 50 warnings
    }
  } = options

  if (logResults) {
    console.log('🔍 Monitoring repository health...')
  }

  // Validate repository
  const validation = validatePromptRepo(repoPath)

  // Send metrics
  monitoringService.sendMetric('prompt_repo.validation.passed', validation.passed ? 1 : 0, {
    repo: repoPath
  })
  monitoringService.sendMetric('prompt_repo.validation.fatal', validation.summary.fatal, {
    repo: repoPath
  })
  monitoringService.sendMetric('prompt_repo.validation.errors', validation.summary.error, {
    repo: repoPath
  })
  monitoringService.sendMetric('prompt_repo.validation.warnings', validation.summary.warning, {
    repo: repoPath
  })
  monitoringService.sendMetric('prompt_repo.validation.info', validation.summary.info, {
    repo: repoPath
  })
  monitoringService.sendMetric('prompt_repo.validation.total_errors', validation.errors.length, {
    repo: repoPath
  })

  // Check thresholds and send alerts
  if (validation.summary.fatal > alertThresholds.fatal) {
    monitoringService.sendAlert(
      'critical',
      `Fatal errors detected: ${validation.summary.fatal}`,
      {
        repo: repoPath,
        errors: validation.errors.filter(e => e.severity === 'fatal')
      }
    )
  }

  if (validation.summary.error > alertThresholds.error) {
    monitoringService.sendAlert(
      'warning',
      `High error count: ${validation.summary.error} errors`,
      {
        repo: repoPath,
        threshold: alertThresholds.error,
        count: validation.summary.error
      }
    )
  }

  if (validation.summary.warning > alertThresholds.warning) {
    monitoringService.sendAlert(
      'info',
      `High warning count: ${validation.summary.warning} warnings`,
      {
        repo: repoPath,
        threshold: alertThresholds.warning,
        count: validation.summary.warning
      }
    )
  }

  // Check for specific error codes
  const criticalErrors = validation.errors.filter(
    e => e.code === ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND ||
         e.code === ERROR_CODE_CONSTANTS.REPO_ROOT_NOT_FOUND
  )

  if (criticalErrors.length > 0) {
    monitoringService.sendAlert(
      'critical',
      'Critical repository structure errors detected',
      {
        repo: repoPath,
        errors: criticalErrors.map(e => e.code)
      }
    )
  }

  // Save metrics if requested
  if (saveMetrics) {
    const metricsPath = join(repoPath, 'metrics.json')
    const metricsData = {
      timestamp: new Date().toISOString(),
      repo: repoPath,
      validation: {
        passed: validation.passed,
        summary: validation.summary
      },
      metrics: monitoringService.getMetrics(),
      alerts: monitoringService.getAlerts()
    }
    
    writeFileSync(metricsPath, JSON.stringify(metricsData, null, 2))
    
    // Also append to metrics log
    const logPath = join(repoPath, 'metrics.log')
    appendFileSync(
      logPath,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        ...validation.summary
      }) + '\n'
    )
    
    if (logResults) {
      console.log(`\n📄 Metrics saved to: ${metricsPath}`)
      console.log(`📝 Metrics log appended to: ${logPath}`)
    }
  }

  if (logResults) {
    console.log('\n📊 Monitoring Summary:')
    console.log(`  Validation: ${validation.passed ? '✅ Passed' : '❌ Failed'}`)
    console.log(`  Fatal: ${validation.summary.fatal}`)
    console.log(`  Errors: ${validation.summary.error}`)
    console.log(`  Warnings: ${validation.summary.warning}`)
    console.log(`  Metrics sent: ${monitoringService.getMetrics().length}`)
    console.log(`  Alerts sent: ${monitoringService.getAlerts().length}`)
  }

  return {
    validation,
    metrics: monitoringService.getMetrics(),
    alerts: monitoringService.getAlerts(),
    monitoringService
  }
}

/**
 * Continuous monitoring
 * Monitor repository at regular intervals
 */
async function continuousMonitoring(repoPath, intervalMs = 60 * 60 * 1000) {
  console.log(`🔄 Starting continuous monitoring (interval: ${intervalMs}ms)...\n`)

  // Initial monitoring
  await monitorRepository(repoPath, {
    logResults: true,
    saveMetrics: true
  })

  // Set up interval
  const intervalId = setInterval(async () => {
    console.log(`\n⏰ Scheduled monitoring check at ${new Date().toISOString()}`)
    await monitorRepository(repoPath, {
      logResults: true,
      saveMetrics: true
    })
  }, intervalMs)

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping continuous monitoring...')
    clearInterval(intervalId)
    process.exit(0)
  })

  return intervalId
}

// Example usage
async function main() {
  const repoPath = process.argv[2] || './prompts'
  const mode = process.argv[3] || 'once' // 'once' or 'continuous'

  if (mode === 'continuous') {
    const intervalMs = parseInt(process.argv[4] || '3600000') // 1 hour default
    await continuousMonitoring(repoPath, intervalMs)
  } else {
    await monitorRepository(repoPath, {
      logResults: true,
      saveMetrics: true,
      alertThresholds: {
        fatal: 0,
        error: 10,
        warning: 50
      }
    })
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { monitorRepository, continuousMonitoring, MonitoringService }

