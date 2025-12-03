# Best Practices

This document provides best practices for using `@carllee1983/prompt-toolkit` effectively.

## Table of Contents

- [Repository Structure](#repository-structure)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Team Collaboration](#team-collaboration)
- [CI/CD Integration](#cicd-integration)
- [Validation Strategies](#validation-strategies)

## Repository Structure

### Organize Prompts by Groups

**Good:**
```
prompts-repo/
├── registry.yaml
├── common/
│   ├── api-design.yaml
│   └── code-review.yaml
├── laravel/
│   ├── laravel-api-implementation.yaml
│   └── laravel-code-generation.yaml
└── partials/
    ├── role-expert.hbs
    └── output-format.hbs
```

**Bad:**
```
prompts-repo/
├── registry.yaml
├── prompt1.yaml
├── prompt2.yaml
├── prompt3.yaml
└── ...
```

**Why:**
- Better organization
- Easier to maintain
- Supports group-based filtering
- Clearer structure

### Use Consistent Naming

**Good:**
- `api-design.yaml`
- `code-review.yaml`
- `laravel-api-implementation.yaml`

**Bad:**
- `API_Design.yaml`
- `codeReview.yaml`
- `laravel-api-implementation-v2-final.yaml`

**Why:**
- Consistent naming makes it easier to find prompts
- Follows common conventions
- Avoids confusion

### Keep Partials Organized

**Good:**
```
partials/
├── roles/
│   ├── expert.hbs
│   └── developer.hbs
├── formats/
│   ├── json.hbs
│   └── markdown.hbs
└── common/
    └── header.hbs
```

**Bad:**
```
partials/
├── role-expert.hbs
├── role-developer.hbs
├── format-json.hbs
├── format-markdown.hbs
└── header.hbs
```

**Why:**
- Better organization
- Easier to find related partials
- Supports larger repositories

## Error Handling

### Use Severity Levels Appropriately

**Good:**
```typescript
const result = validatePromptRepo('./prompts', {
  minSeverity: 'error' // Only show errors and fatal issues
})

if (result.summary.fatal > 0) {
  // Handle fatal errors immediately
  process.exit(1)
}

if (result.summary.error > 0) {
  // Log errors for review
  logErrors(result.errors)
}
```

**Bad:**
```typescript
const result = validatePromptRepo('./prompts')

// Ignoring severity levels
if (result.errors.length > 0) {
  process.exit(1) // Exits on warnings too!
}
```

**Why:**
- Allows warnings without blocking
- Better error prioritization
- More flexible workflows

### Provide Helpful Error Messages

**Good:**
```typescript
result.errors.forEach(err => {
  console.error(`[${err.severity.toUpperCase()}] ${err.code}`)
  console.error(`  Message: ${err.message}`)
  if (err.file) {
    console.error(`  File: ${err.file}`)
  }
  if (err.hint) {
    console.error(`  Hint: ${err.hint}`)
  }
})
```

**Bad:**
```typescript
result.errors.forEach(err => {
  console.error(err.message) // Missing context
})
```

**Why:**
- Better debugging experience
- Faster issue resolution
- Clearer error context

### Handle Specific Error Codes

**Good:**
```typescript
import { ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'

const fatalErrors = result.errors.filter(
  e => e.code === ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND
)

if (fatalErrors.length > 0) {
  // Specific handling for registry not found
  console.error('Registry file is missing!')
  console.error('Please create registry.yaml in the repository root.')
}
```

**Bad:**
```typescript
if (result.errors.length > 0) {
  // Generic error handling
  console.error('Something went wrong')
}
```

**Why:**
- More specific error handling
- Better user experience
- Easier debugging

## Performance Optimization

### Validate Incrementally

**Good:**
```typescript
// Validate only changed files
const changedFiles = getChangedFiles()
for (const file of changedFiles) {
  validatePromptFile(file)
}
```

**Bad:**
```typescript
// Always validate entire repository
validatePromptRepo('./prompts') // Slow for large repos
```

**Why:**
- Faster validation
- Better developer experience
- Reduced CI/CD time

### Cache Validation Results

**Good:**
```typescript
const cache = new Map()

function validateWithCache(repoPath: string) {
  const hash = getRepoHash(repoPath)
  
  if (cache.has(hash)) {
    return cache.get(hash)
  }
  
  const result = validatePromptRepo(repoPath)
  cache.set(hash, result)
  return result
}
```

**Bad:**
```typescript
// Always re-validate
function validate(repoPath: string) {
  return validatePromptRepo(repoPath) // No caching
}
```

**Why:**
- Faster repeated validations
- Better performance
- Reduced resource usage

### Use Appropriate Severity Filters

**Good:**
```typescript
// In CI: Only show errors and fatal
validatePromptRepo('./prompts', { minSeverity: 'error' })

// In development: Show warnings too
validatePromptRepo('./prompts', { minSeverity: 'warning' })
```

**Bad:**
```typescript
// Always show everything
validatePromptRepo('./prompts') // May be too verbose
```

**Why:**
- Focused error reporting
- Less noise
- Better user experience

## Team Collaboration

### Use Pre-commit Hooks

**Good:**
```bash
# .husky/pre-commit
prompt-toolkit validate repo --exit-code --severity error
```

**Why:**
- Prevents invalid commits
- Consistent validation
- Immediate feedback

### Document Validation Rules

**Good:**
```markdown
# Validation Rules

1. All prompts must have descriptions
2. Registry must be valid
3. No circular dependencies in partials
4. All referenced files must exist
```

**Why:**
- Clear expectations
- Better team alignment
- Reduced confusion

### Use CI/CD for Enforcement

**Good:**
```yaml
# .github/workflows/validate.yml
- name: Validate
  run: prompt-toolkit validate repo --exit-code
```

**Why:**
- Automatic validation
- Consistent enforcement
- Prevents broken code

### Share Validation Results

**Good:**
```typescript
// Save results for team review
const result = validatePromptRepo('./prompts')
fs.writeFileSync('validation-results.json', JSON.stringify(result, null, 2))
```

**Why:**
- Team visibility
- Historical tracking
- Better collaboration

## CI/CD Integration

### Fail Fast on Critical Errors

**Good:**
```yaml
- name: Validate
  run: prompt-toolkit validate repo --exit-code --severity fatal
```

**Why:**
- Immediate feedback
- Faster CI/CD
- Clear failure reasons

### Save Validation Results

**Good:**
```yaml
- name: Save results
  if: always()
  run: |
    prompt-toolkit validate repo --format json --output results.json
  
- name: Upload results
  uses: actions/upload-artifact@v4
  with:
    name: validation-results
    path: results.json
```

**Why:**
- Historical tracking
- Debugging support
- Team visibility

### Use Appropriate Exit Codes

**Good:**
```yaml
# Fail on errors and fatal
- run: prompt-toolkit validate repo --exit-code --severity error

# Don't fail on warnings
- run: prompt-toolkit validate repo --severity warning
```

**Why:**
- Flexible CI/CD behavior
- Appropriate failure conditions
- Better workflow control

## Validation Strategies

### Validate Early and Often

**Good:**
- Validate during development
- Validate before committing
- Validate in CI/CD
- Validate before deployment

**Why:**
- Catch errors early
- Faster feedback
- Reduced debugging time

### Use Multiple Validation Levels

**Good:**
```typescript
// Level 1: Quick check
validateRegistry('./registry.yaml', '.')

// Level 2: Full validation
validatePromptRepo('./prompts')

// Level 3: Deep validation
validatePromptRepo('./prompts', { checkPartials: true })
```

**Why:**
- Faster development
- Comprehensive validation
- Flexible validation depth

### Validate Incrementally

**Good:**
```typescript
// Validate only changed files
const changedFiles = getChangedFiles()
for (const file of changedFiles) {
  validatePromptFile(file)
}

// Full validation in CI
validatePromptRepo('./prompts')
```

**Why:**
- Faster local development
- Comprehensive CI validation
- Better developer experience

## Error Code Usage

### Use Error Code Constants

**Good:**
```typescript
import { ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'

if (error.code === ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND) {
  // Handle registry not found
}
```

**Bad:**
```typescript
if (error.code === 'REGISTRY_FILE_NOT_FOUND') {
  // String literal - no type safety
}
```

**Why:**
- Type safety
- Autocomplete support
- Refactoring safety

### Group Errors by Category

**Good:**
```typescript
const registryErrors = result.errors.filter(
  e => e.code.startsWith('REGISTRY_')
)

const promptErrors = result.errors.filter(
  e => e.code.startsWith('PROMPT_')
)
```

**Why:**
- Better error organization
- Easier error handling
- Clearer error categories

## Next Steps

- 📖 Read [Use Cases](USE_CASES.md) for implementation examples
- 🔍 Check [Quick Reference](QUICK_REFERENCE.md) for command reference
- 🐛 See [Troubleshooting](TROUBLESHOOTING.md) for common issues
- 💡 Explore [Examples](../../examples/) for more scenarios

