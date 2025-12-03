# Use Cases

This document describes common use cases for `@carllee1983/prompt-toolkit` and how to implement them.

## Table of Contents

- [CI/CD Integration](#cicd-integration)
- [Local Development Validation](#local-development-validation)
- [Team Collaboration](#team-collaboration)
- [Automated Monitoring](#automated-monitoring)
- [Batch Validation](#batch-validation)
- [Pre-commit Hooks](#pre-commit-hooks)

## CI/CD Integration

### Use Case: Validate Prompts Before Deployment

Ensure prompt repositories are valid before deploying to production.

**Implementation:**

```yaml
# .github/workflows/validate-prompts.yml
name: Validate Prompts

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install prompt-toolkit
        run: npm install -g @carllee1983/prompt-toolkit
      
      - name: Validate repository
        run: prompt-toolkit validate repo --exit-code --severity error
      
      - name: Save results
        if: always()
        run: |
          prompt-toolkit validate repo --format json --output results.json
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: validation-results
          path: results.json
```

**Benefits:**
- Catches errors before deployment
- Prevents broken prompts from reaching production
- Provides validation history

**See Also:**
- [GitHub Actions Example](../../examples/ci-cd-integration/github-actions.yml)
- [GitLab CI Example](../../examples/ci-cd-integration/gitlab-ci.yml)

## Local Development Validation

### Use Case: Validate During Development

Catch validation errors early in the development process.

**Implementation:**

```bash
# Validate before committing
prompt-toolkit validate repo

# Validate with specific severity
prompt-toolkit validate repo --severity warning

# Validate and save results
prompt-toolkit validate repo --format json --output validation.json
```

**Programmatic Usage:**

```typescript
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'

// Validate during development
const result = validatePromptRepo('./prompts')

if (!result.passed) {
  console.error('Validation failed!')
  result.errors.forEach(err => {
    console.error(`[${err.severity}] ${err.code}: ${err.message}`)
    if (err.hint) console.error(`  Hint: ${err.hint}`)
  })
  process.exit(1)
}
```

**Benefits:**
- Immediate feedback
- Faster development cycle
- Prevents committing invalid prompts

## Team Collaboration

### Use Case: Ensure Consistent Prompt Structure

Ensure all team members follow the same prompt repository structure and validation rules.

**Implementation:**

1. **Add validation to shared repository:**
   ```json
   {
     "scripts": {
       "validate": "prompt-toolkit validate repo --exit-code"
     }
   }
   ```

2. **Team members run validation:**
   ```bash
   npm run validate
   ```

3. **CI/CD enforces validation:**
   - All PRs must pass validation
   - Validation runs automatically on push

**Benefits:**
- Consistent structure across team
- Reduced merge conflicts
- Better code quality

## Automated Monitoring

### Use Case: Monitor Repository Health

Track validation results over time and alert on issues.

**Implementation:**

```typescript
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'
import { sendAlert, logMetrics } from './monitoring'

async function monitorRepository() {
  const result = validatePromptRepo('./prompts')
  
  // Log metrics
  logMetrics({
    timestamp: new Date().toISOString(),
    passed: result.passed,
    fatal: result.summary.fatal,
    error: result.summary.error,
    warning: result.summary.warning,
    info: result.summary.info
  })
  
  // Alert on critical issues
  if (result.summary.fatal > 0) {
    await sendAlert({
      level: 'critical',
      message: `${result.summary.fatal} fatal error(s) detected`,
      errors: result.errors.filter(e => e.severity === 'fatal')
    })
  }
  
  // Alert on high error count
  if (result.summary.error > 10) {
    await sendAlert({
      level: 'warning',
      message: `High error count: ${result.summary.error} errors`
    })
  }
}

// Run every hour
setInterval(monitorRepository, 60 * 60 * 1000)
```

**Benefits:**
- Proactive issue detection
- Historical tracking
- Automated alerts

**See Also:**
- [Monitoring Integration Example](../../examples/integration/monitoring-integration.js)

## Batch Validation

### Use Case: Validate Multiple Repositories

Validate multiple prompt repositories in a single operation.

**Implementation:**

```typescript
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'
import { readdir } from 'fs/promises'
import { join } from 'path'

async function validateMultipleRepositories(basePath: string) {
  const repos = await readdir(basePath, { withFileTypes: true })
  const results = []
  
  for (const repo of repos) {
    if (repo.isDirectory()) {
      const repoPath = join(basePath, repo.name)
      console.log(`Validating ${repo.name}...`)
      
      const result = validatePromptRepo(repoPath)
      results.push({
        name: repo.name,
        path: repoPath,
        ...result
      })
      
      if (result.passed) {
        console.log(`✅ ${repo.name}: Passed`)
      } else {
        console.error(`❌ ${repo.name}: Failed`)
        console.error(`  Errors: ${result.summary.error}`)
      }
    }
  }
  
  // Summary
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  console.log(`\nSummary: ${passed} passed, ${failed} failed`)
  
  return results
}

// Usage
validateMultipleRepositories('./repositories')
```

**Benefits:**
- Efficient bulk validation
- Centralized reporting
- Easy to integrate into scripts

**See Also:**
- [Batch Validation Example](../../examples/real-world/batch-validation.js)

## Pre-commit Hooks

### Use Case: Validate Before Committing

Automatically validate prompts before allowing commits.

**Implementation:**

1. **Install husky:**
   ```bash
   npm install --save-dev husky
   npx husky install
   ```

2. **Create pre-commit hook:**
   ```bash
   npx husky add .husky/pre-commit "prompt-toolkit validate repo --exit-code"
   ```

3. **Or use in package.json:**
   ```json
   {
     "scripts": {
       "pre-commit": "prompt-toolkit validate repo --exit-code"
     }
   }
   ```

**Benefits:**
- Prevents invalid commits
- Immediate feedback
- Consistent validation

## Integration with MCP Prompt Manager

### Use Case: Validate Before Loading into MCP

Validate prompts before they're loaded into MCP Prompt Manager.

**Implementation:**

```typescript
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'
import { loadPrompts } from './mcp-prompt-manager'

async function loadValidatedPrompts(repoPath: string) {
  // Validate first
  const validation = validatePromptRepo(repoPath)
  
  if (!validation.passed) {
    throw new Error(`Repository validation failed: ${validation.errors.length} errors`)
  }
  
  // Only load if validation passes
  return loadPrompts(repoPath)
}
```

**Benefits:**
- Prevents loading invalid prompts
- Better error messages
- Safer deployments

**See Also:**
- [MCP Prompt Manager Integration Example](../../examples/integration/mcp-prompt-manager-integration.js)

## Custom Validation Logic

### Use Case: Custom Business Rules

Add custom validation logic on top of the toolkit.

**Implementation:**

```typescript
import { validatePromptRepo, ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'

function customValidation(repoPath: string) {
  const result = validatePromptRepo(repoPath)
  
  // Custom rule: No prompts without descriptions
  const promptsWithoutDescription = result.errors.filter(
    e => e.code === ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID &&
         e.meta?.field === 'description'
  )
  
  if (promptsWithoutDescription.length > 0) {
    return {
      ...result,
      passed: false,
      errors: [
        ...result.errors,
        {
          code: 'CUSTOM_NO_DESCRIPTION',
          severity: 'error' as const,
          message: 'All prompts must have descriptions',
          meta: { count: promptsWithoutDescription.length }
        }
      ]
    }
  }
  
  return result
}
```

**Benefits:**
- Extensible validation
- Business-specific rules
- Flexible error handling

## Next Steps

- 📖 Read [Best Practices](BEST_PRACTICES.md) for recommended patterns
- 🔍 Check [Quick Reference](QUICK_REFERENCE.md) for command reference
- 🐛 See [Troubleshooting](TROUBLESHOOTING.md) for common issues
- 💡 Explore [Examples](../../examples/) for more scenarios

