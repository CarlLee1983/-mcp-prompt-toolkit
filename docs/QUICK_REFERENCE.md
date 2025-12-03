# Quick Reference

Quick reference guide for `@carllee1983/prompt-toolkit` commands, APIs, and error codes.

## Table of Contents

- [CLI Commands](#cli-commands)
- [Programmatic API](#programmatic-api)
- [Error Codes](#error-codes)
- [Common Tasks](#common-tasks)

## CLI Commands

### Validate Commands

```bash
# Validate entire repository
prompt-toolkit validate repo [path]

# Validate registry.yaml
prompt-toolkit validate registry [path] --repo-root <path>

# Validate a single prompt file
prompt-toolkit validate file <file-path>

# Validate partials directory
prompt-toolkit validate partials [path] --partials-path <path>
```

### Check Commands

```bash
# Check partials usage (missing partials and circular dependencies)
prompt-toolkit check partials [path]
```

### List Commands

```bash
# List all prompts
prompt-toolkit list prompts [path] [--group <name>] [--enabled-only]

# List all groups
prompt-toolkit list groups [path] [--enabled-only]
```

### Statistics

```bash
# Show repository statistics
prompt-toolkit stats [path]
```

### Common Options

```bash
# Output format (json|text)
--format <format>

# Write output to file
--output <file>

# Exit with non-zero code on failure
--exit-code

# Minimum severity level (fatal|error|warning|info)
--severity <level>
```

## Programmatic API

### Import

```typescript
import {
  validatePromptRepo,
  validateRegistry,
  validatePromptFile,
  validatePartials,
  ERROR_CODE_CONSTANTS
} from '@carllee1983/prompt-toolkit'
```

### validatePromptRepo

```typescript
function validatePromptRepo(
  repoRoot: string,
  options?: {
    minSeverity?: 'fatal' | 'error' | 'warning' | 'info'
  }
): {
  passed: boolean
  errors: ToolkitError[]
  summary: {
    fatal: number
    error: number
    warning: number
    info: number
  }
}
```

**Example:**
```typescript
const result = validatePromptRepo('./prompts')
if (result.passed) {
  console.log('✅ Validation passed!')
} else {
  console.error('❌ Validation failed:', result.errors)
}
```

### validateRegistry

```typescript
function validateRegistry(
  registryPath: string,
  repoRoot: string
): ZodSafeParseReturnType<RegistryDefinition>
```

**Example:**
```typescript
const result = validateRegistry('./registry.yaml', '.')
if (result.success) {
  console.log('Registry is valid:', result.data)
}
```

### validatePromptFile

```typescript
function validatePromptFile(
  filePath: string
): ZodSafeParseReturnType<PromptDefinition>
```

**Example:**
```typescript
const result = validatePromptFile('./prompts/api-design.yaml')
if (result.success) {
  console.log('Prompt is valid:', result.data)
}
```

### validatePartials

```typescript
function validatePartials(
  repoRoot: string,
  partialPath?: string
): string[]
```

**Example:**
```typescript
const partials = validatePartials('./prompts', 'partials')
console.log('Found partials:', partials)
```

## Error Codes

### Registry Errors (`REGISTRY_*`)

| Code | Severity | Description |
|------|----------|-------------|
| `REGISTRY_FILE_NOT_FOUND` | fatal | Registry file does not exist |
| `REGISTRY_SCHEMA_INVALID` | error | Registry schema validation failed |
| `REGISTRY_GROUP_NOT_FOUND` | error | Group folder not found |
| `REGISTRY_PROMPT_NOT_FOUND` | error | Prompt file not found |
| `REGISTRY_DISABLED_GROUP` | info | Group is disabled |

### Prompt Errors (`PROMPT_*`)

| Code | Severity | Description |
|------|----------|-------------|
| `PROMPT_SCHEMA_INVALID` | error | Prompt schema validation failed |
| `PROMPT_ID_DUPLICATED` | error | Prompt ID is duplicated |
| `PROMPT_ARG_INVALID` | error | Prompt argument validation failed |
| `PROMPT_TEMPLATE_EMPTY` | error | Prompt template is empty |

### Partial Errors (`PARTIAL_*`)

| Code | Severity | Description |
|------|----------|-------------|
| `PARTIAL_NOT_FOUND` | error | Partial file not found |
| `PARTIAL_UNUSED` | warning | Partial file is defined but not used |
| `PARTIAL_CIRCULAR_DEPENDENCY` | error | Circular dependency detected |
| `PARTIAL_PATH_INVALID` | error | Partials path is invalid |

### Repository Errors (`REPO_*`)

| Code | Severity | Description |
|------|----------|-------------|
| `REPO_ROOT_NOT_FOUND` | fatal | Repository root path not found |
| `REPO_STRUCTURE_INVALID` | error | Repository structure is invalid |

### File Errors (`FILE_*`)

| Code | Severity | Description |
|------|----------|-------------|
| `FILE_READ_FAILED` | fatal | Failed to read file |
| `FILE_NOT_YAML` | error | File is not a valid YAML file |

### CLI Errors (`CLI_*`)

| Code | Severity | Description |
|------|----------|-------------|
| `CLI_INVALID_ARGUMENT` | fatal | Invalid CLI argument |
| `CLI_UNKNOWN_COMMAND` | fatal | Unknown CLI command |

### Using Error Code Constants

```typescript
import { ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'

// Check for specific error
if (error.code === ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND) {
  // Handle registry not found
}

// Filter errors by category
const registryErrors = errors.filter(
  e => e.code.startsWith('REGISTRY_')
)
```

## Common Tasks

### Validate Repository

```bash
# Basic validation
prompt-toolkit validate repo

# With JSON output
prompt-toolkit validate repo --format json

# Save to file
prompt-toolkit validate repo --format json --output results.json

# Fail on errors
prompt-toolkit validate repo --exit-code
```

### Filter by Severity

```bash
# Show only errors and fatal
prompt-toolkit validate repo --severity error

# Show warnings and above
prompt-toolkit validate repo --severity warning

# Show everything
prompt-toolkit validate repo --severity info
```

### Validate Single File

```bash
# Validate a prompt file
prompt-toolkit validate file ./prompts/api-design.yaml

# With JSON output
prompt-toolkit validate file ./prompts/api-design.yaml --format json
```

### Check Partials

```bash
# Check partials usage
prompt-toolkit check partials

# Save results
prompt-toolkit check partials --format json --output partials-check.json
```

### List Prompts

```bash
# List all prompts
prompt-toolkit list prompts

# List prompts in a group
prompt-toolkit list prompts --group common

# List only enabled prompts
prompt-toolkit list prompts --enabled-only
```

### Get Statistics

```bash
# Show statistics
prompt-toolkit stats

# JSON format
prompt-toolkit stats --format json
```

### CI/CD Integration

```bash
# Fail on validation errors
prompt-toolkit validate repo --exit-code --severity error

# Save results for artifacts
prompt-toolkit validate repo --format json --output validation-results.json
```

### Programmatic Usage

```typescript
// Basic validation
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'

const result = validatePromptRepo('./prompts')
if (!result.passed) {
  console.error('Validation failed:', result.errors)
  process.exit(1)
}

// With severity filtering
const result = validatePromptRepo('./prompts', {
  minSeverity: 'error'
})

// Check specific error codes
import { ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'

const fatalErrors = result.errors.filter(
  e => e.code === ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND
)
```

## Severity Levels

| Level | Priority | Description | CLI Behavior |
|-------|----------|-------------|--------------|
| `fatal` | 0 | Critical errors that prevent validation | Always exits with code 1 |
| `error` | 1 | Validation failures that should be fixed | Default minimum level |
| `warning` | 2 | Non-critical issues to review | Non-blocking |
| `info` | 3 | Informational messages | Non-blocking |

## Type Definitions

### ToolkitError

```typescript
interface ToolkitError {
  code: string                    // Error code (e.g., 'REGISTRY_FILE_NOT_FOUND')
  severity: Severity              // 'fatal' | 'error' | 'warning' | 'info'
  message: string                 // Human-readable error message
  file?: string                   // File path where error occurred
  hint?: string                   // Helpful hint for resolving the error
  meta?: Record<string, unknown>  // Additional error metadata
}
```

### RegistryDefinition

```typescript
interface RegistryDefinition {
  version: number
  globals?: Record<string, string>
  partials?: {
    enabled: boolean
    path: string
  }
  groups: Record<string, RegistryGroup>
}

interface RegistryGroup {
  path: string
  enabled: boolean
  prompts: string[]
}
```

### PromptDefinition

```typescript
interface PromptDefinition {
  id: string
  title: string
  description: string
  args: Record<string, PromptArg>
  template: string
}

interface PromptArg {
  type: 'string' | 'number' | 'boolean' | 'object'
  description?: string
  required?: boolean
  default?: unknown
}
```

## Next Steps

- 📖 Read [Use Cases](USE_CASES.md) for implementation examples
- 🔍 Check [Best Practices](BEST_PRACTICES.md) for recommended patterns
- 🐛 See [Troubleshooting](TROUBLESHOOTING.md) for common issues
- 💡 Explore [Examples](../../examples/) for more scenarios

