# API Stability

This document defines the API stability commitment for `@carllee1983/prompt-toolkit` starting from version 1.0.0.

## Versioning Strategy

Starting from version 1.0.0, this project follows [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes to public APIs
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## Stability Commitment

### Public API Stability

All public APIs exported from the main entry point (`@carllee1983/prompt-toolkit`) are considered **stable** and will maintain backward compatibility within the same major version.

### Breaking Changes Policy

Breaking changes will only occur in major version updates (e.g., 1.x.x → 2.0.0) and will be:

1. **Clearly documented** in the CHANGELOG
2. **Deprecated** in a minor version before removal (when possible)
3. **Accompanied** by a migration guide

## Public API Surface

### Core Validation Functions

#### `validatePromptRepo(repoRoot: string, options?: ValidatePromptRepoOptions): ValidatePromptRepoResult`

Validates an entire prompt repository.

**Stability:** Stable (1.0.0+)

**Parameters:**
- `repoRoot: string` - Path to the repository root directory
- `options?: ValidatePromptRepoOptions` - Optional validation options
  - `minSeverity?: Severity` - Minimum severity level to include in results

**Returns:**
```typescript
{
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

**Breaking Changes:** None planned for 1.x.x

---

#### `validateRegistry(registryPath: string, repoRoot: string): ValidateRegistryResult`

Validates a registry.yaml file.

**Stability:** Stable (1.0.0+)

**Parameters:**
- `registryPath: string` - Path to the registry.yaml file
- `repoRoot: string` - Path to the repository root directory

**Returns:**
```typescript
{
  success: boolean
  data?: RegistryDefinition
  errors?: ToolkitError[]
}
```

**Breaking Changes:** None planned for 1.x.x

---

#### `validatePromptFile(filePath: string): ValidatePromptFileResult`

Validates a single prompt YAML file.

**Stability:** Stable (1.0.0+)

**Parameters:**
- `filePath: string` - Path to the prompt YAML file

**Returns:**
```typescript
{
  success: boolean
  data?: PromptDefinition
  errors?: ToolkitError[]
}
```

**Breaking Changes:** None planned for 1.x.x

---

#### `validatePartials(repoRoot: string, partialPath?: string): string[]`

Validates and returns all partial files in the specified directory.

**Stability:** Stable (1.0.0+)

**Parameters:**
- `repoRoot: string` - Path to the repository root directory
- `partialPath?: string` - Optional path to partials directory (relative to repoRoot)

**Returns:**
- `string[]` - Array of partial file paths

**Breaking Changes:** None planned for 1.x.x

---

#### `validatePartialsUsage(repoRoot: string, partialPath?: string): ToolkitError[]`

Validates partial usage in templates, detecting missing partials and circular dependencies.

**Stability:** Stable (1.0.0+)

**Parameters:**
- `repoRoot: string` - Path to the repository root directory
- `partialPath?: string` - Optional path to partials directory (relative to repoRoot)

**Returns:**
- `ToolkitError[]` - Array of validation errors

**Breaking Changes:** None planned for 1.x.x

---

### Type Definitions

#### `Severity`

Error severity level type.

**Stability:** Stable (1.0.0+)

```typescript
type Severity = 'fatal' | 'error' | 'warning' | 'info'
```

**Breaking Changes:** None planned for 1.x.x

---

#### `ToolkitError`

Standard error object structure.

**Stability:** Stable (1.0.0+)

```typescript
interface ToolkitError {
  code: string
  severity: Severity
  message: string
  file?: string
  hint?: string
  meta?: Record<string, unknown>
}
```

**Breaking Changes:** None planned for 1.x.x

---

#### `ValidatePromptRepoOptions`

Options for repository validation.

**Stability:** Stable (1.0.0+)

```typescript
interface ValidatePromptRepoOptions {
  minSeverity?: Severity
}
```

**Breaking Changes:** None planned for 1.x.x

---

#### `ValidatePromptRepoResult`

Result of repository validation.

**Stability:** Stable (1.0.0+)

```typescript
interface ValidatePromptRepoResult {
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

**Breaking Changes:** None planned for 1.x.x

---

### Error Code Constants

#### `ERROR_CODE_CONSTANTS`

Object containing all error code constants.

**Stability:** Stable (1.0.0+)

**Structure:**
```typescript
{
  REGISTRY_FILE_NOT_FOUND: 'REGISTRY_FILE_NOT_FOUND'
  REGISTRY_SCHEMA_INVALID: 'REGISTRY_SCHEMA_INVALID'
  REGISTRY_GROUP_NOT_FOUND: 'REGISTRY_GROUP_NOT_FOUND'
  REGISTRY_PROMPT_NOT_FOUND: 'REGISTRY_PROMPT_NOT_FOUND'
  REGISTRY_DISABLED_GROUP: 'REGISTRY_DISABLED_GROUP'
  PROMPT_SCHEMA_INVALID: 'PROMPT_SCHEMA_INVALID'
  PROMPT_ID_DUPLICATED: 'PROMPT_ID_DUPLICATED'
  PROMPT_ARG_INVALID: 'PROMPT_ARG_INVALID'
  PROMPT_TEMPLATE_EMPTY: 'PROMPT_TEMPLATE_EMPTY'
  PARTIAL_NOT_FOUND: 'PARTIAL_NOT_FOUND'
  PARTIAL_UNUSED: 'PARTIAL_UNUSED'
  PARTIAL_CIRCULAR_DEPENDENCY: 'PARTIAL_CIRCULAR_DEPENDENCY'
  PARTIAL_PATH_INVALID: 'PARTIAL_PATH_INVALID'
  REPO_ROOT_NOT_FOUND: 'REPO_ROOT_NOT_FOUND'
  REPO_STRUCTURE_INVALID: 'REPO_STRUCTURE_INVALID'
  FILE_READ_FAILED: 'FILE_READ_FAILED'
  FILE_NOT_YAML: 'FILE_NOT_YAML'
  CLI_INVALID_ARGUMENT: 'CLI_INVALID_ARGUMENT'
  CLI_UNKNOWN_COMMAND: 'CLI_UNKNOWN_COMMAND'
}
```

**Breaking Changes:** 
- New error codes may be added in minor versions
- Existing error codes will not be removed in 1.x.x

---

## Internal APIs

APIs not exported from the main entry point are considered **internal** and may change without notice:

- Internal utility functions
- CLI implementation details
- Schema definitions (unless explicitly exported)
- Internal types and interfaces

## Deprecation Policy

When an API needs to be removed:

1. **Deprecation Notice**: The API will be marked as deprecated in a minor version
2. **Documentation**: Deprecation will be documented in CHANGELOG
3. **Removal**: The API will be removed in the next major version
4. **Migration Guide**: A migration guide will be provided

Example deprecation timeline:
- Version 1.2.0: API marked as deprecated
- Version 1.3.0: API still available but deprecated
- Version 2.0.0: API removed

## CLI Stability

The CLI interface is considered stable:

- Command names and structure
- Option flags and arguments
- Output formats (text, JSON)
- Exit codes

CLI changes will follow the same versioning strategy as the programmatic API.

## Schema Stability

YAML schema definitions (registry.yaml, prompt files) are considered stable:

- Field names and types
- Required vs optional fields
- Structure and nesting

Schema changes will be documented as breaking changes and require a major version update.

## Support Policy

### Node.js Versions

- **Minimum**: Node.js 18.0.0
- **Tested**: Latest LTS versions
- **Support**: Current and previous LTS versions

### TypeScript Versions

- **Minimum**: TypeScript 5.4.0
- **Recommended**: Latest stable version

## Reporting Issues

If you encounter an API that doesn't behave as documented:

1. Check the [CHANGELOG](CHANGELOG.md) for recent changes
2. Review the [Migration Guide](MIGRATION_GUIDE.md) if upgrading
3. Open an [Issue](https://github.com/CarlLee1983/mcp-prompt-toolkit/issues) with:
   - Version number
   - Expected behavior
   - Actual behavior
   - Code example

## Summary

- **1.0.0+**: All public APIs are stable
- **Breaking Changes**: Only in major versions (2.0.0, 3.0.0, etc.)
- **New Features**: Added in minor versions (1.1.0, 1.2.0, etc.)
- **Bug Fixes**: Released in patch versions (1.0.1, 1.0.2, etc.)
- **Deprecation**: Announced in minor versions, removed in major versions

For questions or concerns about API stability, please open an issue or discussion on GitHub.

