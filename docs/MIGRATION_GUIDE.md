# Migration Guide: 0.4.x to 1.0.0

This guide helps you migrate from `@carllee1983/prompt-toolkit` version 0.4.x to 1.0.0.

## Overview

Version 1.0.0 marks the **production-ready** release of the toolkit. This version introduces API stability guarantees and follows semantic versioning going forward.

**Key Changes:**
- ✅ **No breaking changes** from 0.4.2 to 1.0.0
- ✅ API stability commitment starting from 1.0.0
- ✅ Enhanced documentation and examples
- ✅ Improved error handling and reporting

## Breaking Changes

### None

There are **no breaking changes** when upgrading from 0.4.2 to 1.0.0. The API remains fully backward compatible.

## What's New in 1.0.0

### API Stability

Starting from 1.0.0, all public APIs are considered stable and will maintain backward compatibility within the same major version. See [API Stability](API_STABILITY.md) for details.

### Enhanced Documentation

- Comprehensive API documentation
- Migration guides
- Best practices documentation
- Troubleshooting guides
- Use case examples

### Improved Error Handling

The error handling system introduced in 0.4.0 remains unchanged and is now considered stable:

- Standardized error codes
- Four-level severity system (fatal, error, warning, info)
- Error hints and metadata
- Summary statistics

## Migration Steps

### Step 1: Update Package Version

Update your `package.json`:

```json
{
  "dependencies": {
    "@carllee1983/prompt-toolkit": "^1.0.0"
  }
}
```

Then install:

```bash
npm install @carllee1983/prompt-toolkit@^1.0.0
# or
pnpm add @carllee1983/prompt-toolkit@^1.0.0
# or
yarn add @carllee1983/prompt-toolkit@^1.0.0
```

### Step 2: Review Your Code

Since there are no breaking changes, your existing code should work without modifications. However, we recommend:

1. **Review error handling**: Ensure you're using the error code constants correctly
2. **Check severity filtering**: Verify your severity filtering logic works as expected
3. **Update type imports**: If using TypeScript, ensure type imports are correct

### Step 3: Test Your Integration

Run your tests to ensure everything works:

```bash
# If you have tests
npm test

# Or manually test your integration
node your-script.js
```

### Step 4: Update Documentation

If you have documentation referencing the toolkit:

- Update version numbers
- Reference the new API stability documentation
- Update any examples if needed

## Code Examples

### Before (0.4.x) and After (1.0.0)

The API is identical, so your code should work without changes:

```typescript
// This works in both 0.4.x and 1.0.0
import { validatePromptRepo, ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'

const result = validatePromptRepo('./prompts', {
  minSeverity: 'error'
})

if (!result.passed) {
  const fatalErrors = result.errors.filter(
    e => e.code === ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND
  )
  // Handle errors...
}
```

### Using Error Codes

Error code constants remain the same:

```typescript
import { ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'

// All error codes are available
ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND
ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID
ERROR_CODE_CONSTANTS.PARTIAL_NOT_FOUND
// ... etc
```

### Severity Filtering

Severity filtering works the same way:

```typescript
const result = validatePromptRepo('./prompts', {
  minSeverity: 'warning' // 'fatal' | 'error' | 'warning' | 'info'
})

// Result includes errors with severity >= minSeverity
console.log(result.errors) // Only warnings, errors, and fatal errors
console.log(result.summary) // Counts for all severities
```

## CLI Usage

CLI commands remain unchanged:

```bash
# All commands work the same way
prompt-toolkit validate repo
prompt-toolkit validate registry
prompt-toolkit validate file path/to/file.yaml
prompt-toolkit check partials
prompt-toolkit list prompts
prompt-toolkit stats

# Options remain the same
prompt-toolkit validate repo --severity warning --format json
```

## TypeScript Types

All TypeScript types remain the same:

```typescript
import type {
  ToolkitError,
  Severity,
  ValidatePromptRepoResult,
  ValidatePromptRepoOptions
} from '@carllee1983/prompt-toolkit'

// Types work exactly the same
const result: ValidatePromptRepoResult = validatePromptRepo('./prompts')
const error: ToolkitError = result.errors[0]
const severity: Severity = error.severity
```

## Common Issues

### Issue: Type Errors After Upgrade

**Solution:** Clear your TypeScript cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
# or
pnpm install
```

### Issue: Import Errors

**Solution:** Ensure you're importing from the main package:

```typescript
// ✅ Correct
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'

// ❌ Incorrect (internal paths may change)
import { validatePromptRepo } from '@carllee1983/prompt-toolkit/src/validators/validateRepo'
```

### Issue: CLI Not Found

**Solution:** Reinstall the CLI globally:

```bash
npm install -g @carllee1983/prompt-toolkit@^1.0.0
```

## What to Expect After Migration

### Benefits

1. **API Stability**: No unexpected breaking changes in 1.x.x versions
2. **Better Documentation**: Comprehensive guides and examples
3. **Long-term Support**: Clear versioning strategy
4. **Production Ready**: Marked as stable for production use

### Versioning Going Forward

- **1.0.1, 1.0.2, etc.**: Bug fixes only, fully backward compatible
- **1.1.0, 1.2.0, etc.**: New features, backward compatible
- **2.0.0**: Breaking changes (with migration guide)

## Need Help?

If you encounter issues during migration:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review the [API Stability](API_STABILITY.md) documentation
3. Check the [CHANGELOG](../CHANGELOG.md) for detailed changes
4. Open an [Issue](https://github.com/CarlLee1983/mcp-prompt-toolkit/issues) on GitHub

## Summary

- ✅ **No code changes required** - API is fully backward compatible
- ✅ **Update version** - Change to `^1.0.0` in package.json
- ✅ **Test your integration** - Verify everything works
- ✅ **Enjoy stability** - API will remain stable in 1.x.x versions

The migration from 0.4.x to 1.0.0 is straightforward with no breaking changes. Simply update the version and continue using the toolkit as before!

