# Troubleshooting Guide

Common issues and solutions when using `@carllee1983/prompt-toolkit`.

## Table of Contents

- [Common Errors](#common-errors)
- [Validation Issues](#validation-issues)
- [CLI Issues](#cli-issues)
- [Performance Issues](#performance-issues)
- [Integration Issues](#integration-issues)

## Common Errors

### REGISTRY_FILE_NOT_FOUND

**Error Message:**
```
[FATAL] REGISTRY_FILE_NOT_FOUND: Registry file not found: /path/to/registry.yaml
```

**Causes:**
- Registry file doesn't exist at the expected location
- Wrong repository path specified
- File permissions issue

**Solutions:**
1. **Check file exists:**
   ```bash
   ls -la registry.yaml
   ```

2. **Verify repository path:**
   ```bash
   prompt-toolkit validate repo /correct/path
   ```

3. **Check file permissions:**
   ```bash
   chmod 644 registry.yaml
   ```

4. **Create registry.yaml if missing:**
   ```yaml
   version: 1
   groups: {}
   ```

### REGISTRY_SCHEMA_INVALID

**Error Message:**
```
[ERROR] REGISTRY_SCHEMA_INVALID: Registry schema validation failed
```

**Causes:**
- Missing required fields
- Invalid field types
- YAML syntax errors

**Solutions:**
1. **Check required fields:**
   - `version` (number)
   - `groups` (object)

2. **Validate YAML syntax:**
   ```bash
   # Use online YAML validator or
   python -c "import yaml; yaml.safe_load(open('registry.yaml'))"
   ```

3. **Check field types:**
   ```yaml
   version: 1  # Must be number, not string
   groups:     # Must be object
     common:
       path: common
       enabled: true
       prompts: []
   ```

### PROMPT_SCHEMA_INVALID

**Error Message:**
```
[ERROR] PROMPT_SCHEMA_INVALID: Prompt schema validation failed
```

**Causes:**
- Missing required fields (`id`, `title`, `description`, `template`)
- Invalid field types
- YAML syntax errors

**Solutions:**
1. **Check required fields:**
   ```yaml
   id: prompt-id        # Required: string
   title: Prompt Title  # Required: string
   description: ...     # Required: string
   template: |         # Required: string
     Template content
   ```

2. **Validate field types:**
   ```yaml
   args:
     name:
       type: string     # Must be: string, number, boolean, or object
       required: true   # Optional: boolean
       default: ""      # Optional: any
   ```

3. **Check YAML indentation:**
   - Use spaces, not tabs
   - Consistent indentation (2 spaces recommended)

### PARTIAL_NOT_FOUND

**Error Message:**
```
[ERROR] PARTIAL_NOT_FOUND: Partial file not found: partial-name
```

**Causes:**
- Partial file doesn't exist
- Wrong partial path
- Incorrect partials directory configuration

**Solutions:**
1. **Check partial file exists:**
   ```bash
   ls -la partials/partial-name.hbs
   ```

2. **Verify partial path in template:**
   ```handlebars
   {{> partial-name}}  <!-- Correct -->
   {{> partials/partial-name}}  <!-- Wrong if partials path is configured -->
   ```

3. **Check partials directory in registry.yaml:**
   ```yaml
   partials:
     enabled: true
     path: partials  # Relative to repository root
   ```

4. **Verify file extension:**
   - Partials should have `.hbs` extension
   - Check case sensitivity (Linux/Mac)

### PARTIAL_CIRCULAR_DEPENDENCY

**Error Message:**
```
[ERROR] PARTIAL_CIRCULAR_DEPENDENCY: Circular dependency detected
```

**Causes:**
- Partials reference each other in a loop
- Indirect circular dependencies

**Solutions:**
1. **Identify the cycle:**
   - Check error's `meta.chain` field
   - Example: `partial-a → partial-b → partial-a`

2. **Break the cycle:**
   - Extract common content to a third partial
   - Restructure partial dependencies
   - Remove circular reference

3. **Example fix:**
   ```handlebars
   <!-- Before: partial-a.hbs -->
   {{> partial-b}}
   
   <!-- Before: partial-b.hbs -->
   {{> partial-a}}  <!-- Circular! -->
   
   <!-- After: Extract common content -->
   <!-- partial-common.hbs -->
   Common content
   
   <!-- partial-a.hbs -->
   {{> partial-common}}
   A-specific content
   
   <!-- partial-b.hbs -->
   {{> partial-common}}
   B-specific content
   ```

### FILE_NOT_YAML

**Error Message:**
```
[ERROR] FILE_NOT_YAML: File is not a valid YAML file
```

**Causes:**
- Invalid YAML syntax
- File encoding issues
- Missing file extension

**Solutions:**
1. **Validate YAML syntax:**
   ```bash
   # Online: https://www.yamllint.com/
   # Or use Python
   python -c "import yaml; yaml.safe_load(open('file.yaml'))"
   ```

2. **Check common YAML issues:**
   - Tabs instead of spaces
   - Inconsistent indentation
   - Missing quotes for special characters
   - Trailing commas (not allowed in YAML)

3. **Check file encoding:**
   ```bash
   file -bi file.yaml  # Should be: text/plain; charset=utf-8
   ```

## Validation Issues

### Validation Always Fails

**Symptoms:**
- Validation fails even with valid files
- Errors don't make sense

**Solutions:**
1. **Check repository path:**
   ```bash
   # Use absolute path
   prompt-toolkit validate repo /absolute/path/to/repo
   ```

2. **Verify file structure:**
   ```
   repo/
   ├── registry.yaml
   ├── group-name/
   │   └── prompt.yaml
   └── partials/
       └── partial.hbs
   ```

3. **Check for hidden characters:**
   ```bash
   cat -A registry.yaml  # Show all characters
   ```

### Warnings Treated as Errors

**Symptoms:**
- CI/CD fails on warnings
- Want to ignore warnings

**Solutions:**
1. **Use severity filter:**
   ```bash
   prompt-toolkit validate repo --severity error
   ```

2. **In CI/CD:**
   ```yaml
   - run: prompt-toolkit validate repo --exit-code --severity error
   ```

3. **Programmatically:**
   ```typescript
   const result = validatePromptRepo('./prompts', {
     minSeverity: 'error'  // Ignore warnings
   })
   ```

### Slow Validation

**Symptoms:**
- Validation takes too long
- Large repositories are slow

**Solutions:**
1. **Validate incrementally:**
   ```typescript
   // Only validate changed files
   const changedFiles = getChangedFiles()
   for (const file of changedFiles) {
     validatePromptFile(file)
   }
   ```

2. **Use severity filtering:**
   ```bash
   # Skip info messages
   prompt-toolkit validate repo --severity error
   ```

3. **Cache results:**
   ```typescript
   // Implement caching for repeated validations
   const cache = new Map()
   // ... (see Best Practices)
   ```

## CLI Issues

### Command Not Found

**Symptoms:**
```
command not found: prompt-toolkit
```

**Solutions:**
1. **Install globally:**
   ```bash
   npm install -g @carllee1983/prompt-toolkit
   ```

2. **Use npx:**
   ```bash
   npx @carllee1983/prompt-toolkit validate repo
   ```

3. **Check PATH:**
   ```bash
   echo $PATH
   which npm
   npm config get prefix
   ```

### Exit Code Not Working

**Symptoms:**
- CI/CD doesn't fail on errors
- Exit code always 0

**Solutions:**
1. **Use --exit-code flag:**
   ```bash
   prompt-toolkit validate repo --exit-code
   ```

2. **Check severity:**
   ```bash
   # Fatal errors always exit 1
   # Use --exit-code for other severities
   prompt-toolkit validate repo --exit-code --severity error
   ```

3. **Verify in script:**
   ```bash
   #!/bin/bash
   set -e  # Exit on error
   prompt-toolkit validate repo --exit-code
   ```

### JSON Output Issues

**Symptoms:**
- JSON output is malformed
- Can't parse JSON results

**Solutions:**
1. **Use --format json:**
   ```bash
   prompt-toolkit validate repo --format json
   ```

2. **Save to file:**
   ```bash
   prompt-toolkit validate repo --format json --output results.json
   ```

3. **Parse in script:**
   ```bash
   prompt-toolkit validate repo --format json > results.json
   jq '.' results.json  # Validate JSON
   ```

## Performance Issues

### Large Repository Slow

**Symptoms:**
- Validation takes minutes
- High memory usage

**Solutions:**
1. **Validate incrementally:**
   - Only validate changed files
   - Use file watching

2. **Optimize repository structure:**
   - Split into multiple repositories
   - Use group filtering

3. **Use caching:**
   - Cache validation results
   - Invalidate on file changes

### High Memory Usage

**Symptoms:**
- Process uses too much memory
- System becomes slow

**Solutions:**
1. **Validate in batches:**
   ```typescript
   // Validate groups separately
   for (const group of groups) {
     validateGroup(group)
   }
   ```

2. **Limit concurrent validations:**
   - Process files sequentially
   - Use streaming for large files

## Integration Issues

### CI/CD Integration Fails

**Symptoms:**
- GitHub Actions fails
- GitLab CI fails

**Solutions:**
1. **Check Node.js version:**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: 20  # Node 18+ required
   ```

2. **Install package:**
   ```yaml
   - run: npm install -g @carllee1983/prompt-toolkit
   ```

3. **Use correct path:**
   ```yaml
   - run: prompt-toolkit validate repo . --exit-code
   ```

### Programmatic API Issues

**Symptoms:**
- Import errors
- Type errors
- Runtime errors

**Solutions:**
1. **Check TypeScript version:**
   ```json
   {
     "devDependencies": {
       "typescript": "^5.4.0"
     }
   }
   ```

2. **Verify imports:**
   ```typescript
   import { validatePromptRepo } from '@carllee1983/prompt-toolkit'
   // Not: from '@carllee1983/prompt-toolkit/src/...'
   ```

3. **Check return types:**
   ```typescript
   const result = validatePromptRepo('./prompts')
   // result.passed: boolean
   // result.errors: ToolkitError[]
   // result.summary: { fatal, error, warning, info }
   ```

## Getting More Help

- 📖 Read [Quick Reference](QUICK_REFERENCE.md) for command reference
- 💡 Check [Best Practices](BEST_PRACTICES.md) for recommended patterns
- 📚 See [Use Cases](USE_CASES.md) for implementation examples
- 🐛 Open an [Issue](https://github.com/CarlLee1983/mcp-prompt-toolkit/issues) if problem persists
- 💬 Check [FAQ](../README.md#-frequently-asked-questions-faq) for common questions

