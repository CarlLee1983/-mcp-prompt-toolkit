# Examples

This directory contains comprehensive example code demonstrating how to use `@carllee1983/prompt-toolkit` in various scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [TypeScript Examples](#typescript-examples)
- [Advanced Scenarios](#advanced-scenarios)
- [CI/CD Integration](#cicd-integration)
- [Integration Examples](#integration-examples)
- [Real-World Scenarios](#real-world-scenarios)
- [Running Examples](#running-examples)
- [Requirements](#requirements)
- [Next Steps](#next-steps)

## Basic Usage

Simple examples to get started quickly.

### `validate-repo.js`
Complete example of validating an entire prompt repository with error handling and severity-based reporting.

**Features:**
- Full repository validation
- Error grouping by severity
- Detailed error display with hints
- Summary statistics

**Usage:**
```bash
node examples/basic-usage/validate-repo.js [repo-path]
# or
npx tsx examples/basic-usage/validate-repo.js [repo-path]
```

### `validate-single-file.js`
Example of validating a single prompt YAML file.

**Features:**
- Single file validation
- Error display with metadata
- Exit code handling

**Usage:**
```bash
node examples/basic-usage/validate-single-file.js [file-path]
# or
npx tsx examples/basic-usage/validate-single-file.js [file-path]
```

### `validate-registry.js`
Example of validating a registry.yaml file and checking referenced files.

**Features:**
- Registry structure validation
- Prompt counting
- Group enumeration

**Usage:**
```bash
node examples/basic-usage/validate-registry.js [registry-path] [repo-root]
# or
npx tsx examples/basic-usage/validate-registry.js [registry-path] [repo-root]
```

## TypeScript Examples

TypeScript examples with full type safety.

### `validate-repo.ts`
TypeScript example demonstrating type-safe repository validation.

**Features:**
- Full TypeScript type safety
- Type-safe error handling
- Structured error display

**Usage:**
```bash
npx tsx examples/typescript/validate-repo.ts [repo-path]
# or compile first:
tsc examples/typescript/validate-repo.ts
node examples/typescript/validate-repo.js [repo-path]
```

### `custom-validator.ts`
Advanced TypeScript example showing how to create custom validators with business rules.

**Features:**
- Custom validation rules
- File size validation
- Description length validation
- Args requirement validation
- Type-safe error creation

**Usage:**
```bash
npx tsx examples/typescript/custom-validator.ts [repo-path]
```

## Advanced Scenarios

Advanced usage patterns and error handling.

### `custom-error-handler.js`
Demonstrates custom error handling with severity filtering and callbacks.

**Features:**
- Severity-based filtering
- Custom error handlers
- Callback system
- Error grouping

**Usage:**
```bash
node examples/advanced-scenarios/custom-error-handler.js [repo-path]
# or
npx tsx examples/advanced-scenarios/custom-error-handler.js [repo-path]
```

### `error-code-checker.js`
Shows how to check for specific error codes and handle them programmatically.

**Features:**
- Error code checking
- Specific error handling
- Error code constants usage
- Exit code management

**Usage:**
```bash
node examples/advanced-scenarios/error-code-checker.js [repo-path]
# or
npx tsx examples/advanced-scenarios/error-code-checker.js [repo-path]
```

## CI/CD Integration

Ready-to-use CI/CD pipeline configurations.

### `github-actions.yml`
Complete GitHub Actions workflow for validating prompts in CI/CD pipeline.

**Features:**
- Automatic validation on push/PR
- JSON output for artifacts
- Exit code handling
- Results upload

**Usage:**
1. Copy to `.github/workflows/validate-prompts.yml`
2. Customize the workflow as needed
3. Push to your repository

**Example:**
```yaml
# See examples/ci-cd-integration/github-actions.yml
```

### `gitlab-ci.yml`
GitLab CI pipeline configuration for prompt validation.

**Features:**
- GitLab CI integration
- Validation stages
- Artifact collection

**Usage:**
1. Copy to `.gitlab-ci.yml` in your repository root
2. Customize the pipeline as needed
3. Commit and push

## Integration Examples

Examples showing integration with other systems.

### `mcp-prompt-manager-integration.js`
Integration example with MCP Prompt Manager to validate prompts before loading.

**Features:**
- Pre-load validation
- Development vs production modes
- Validation report generation
- Error handling

**Usage:**
```bash
# Development mode (allows warnings)
node examples/integration/mcp-prompt-manager-integration.js [repo-path] development

# Production mode (fails on warnings)
node examples/integration/mcp-prompt-manager-integration.js [repo-path] production
```

### `monitoring-integration.js`
Integration example with monitoring systems to track repository health.

**Features:**
- Metrics collection
- Alert system
- Continuous monitoring
- Historical tracking

**Usage:**
```bash
# Single monitoring check
node examples/integration/monitoring-integration.js [repo-path] once

# Continuous monitoring (every hour)
node examples/integration/monitoring-integration.js [repo-path] continuous 3600000
```

## Real-World Scenarios

Production-ready examples for common use cases.

### `ci-validation-pipeline.js`
Complete CI validation pipeline with comprehensive reporting.

**Features:**
- Multi-stage validation
- Multiple report formats
- Error code distribution
- Threshold checking
- Artifact generation

**Usage:**
```bash
node examples/real-world/ci-validation-pipeline.js [repo-path] [output-dir]
# or
npx tsx examples/real-world/ci-validation-pipeline.js [repo-path] [output-dir]
```

**Output:**
- `validation-results.json` - Complete validation results
- `error-summary.json` - Error summary by severity, code, and file
- `fatal-errors.json`, `error-errors.json`, etc. - Severity-based reports
- `error-code-distribution.json` - Error code distribution
- `pipeline-results.json` - Final pipeline results

### `batch-validation.js`
Validate multiple prompt repositories in batch.

**Features:**
- Repository discovery
- Parallel or sequential validation
- Consolidated reporting
- Execution time tracking

**Usage:**
```bash
# Sequential validation
node examples/real-world/batch-validation.js [base-path] [output-file]

# Parallel validation
node examples/real-world/batch-validation.js [base-path] [output-file] --parallel
```

## Running Examples

### JavaScript Examples

All JavaScript examples use ES modules. Make sure your `package.json` has:

```json
{
  "type": "module"
}
```

Or use a tool like `tsx` to run them directly:

```bash
npx tsx examples/basic-usage/validate-repo.js
```

### TypeScript Examples

TypeScript examples can be run using `tsx`:

```bash
npx tsx examples/typescript/validate-repo.ts
```

Or compile first:

```bash
tsc examples/typescript/validate-repo.ts
node examples/typescript/validate-repo.js
```

### Example Execution Guide

1. **Install dependencies:**
   ```bash
   npm install @carllee1983/prompt-toolkit
   # or
   pnpm add @carllee1983/prompt-toolkit
   ```

2. **Run an example:**
   ```bash
   # Basic example
   npx tsx examples/basic-usage/validate-repo.js ./my-prompts
   
   # TypeScript example
   npx tsx examples/typescript/validate-repo.ts ./my-prompts
   
   # Integration example
   npx tsx examples/integration/mcp-prompt-manager-integration.js ./my-prompts
   ```

3. **Customize for your needs:**
   - Modify example code to match your requirements
   - Adjust paths and options
   - Add your own validation logic

## Requirements

- **Node.js**: Version 18 or higher
- **Package Manager**: npm, pnpm, or yarn
- **@carllee1983/prompt-toolkit**: Installed as dependency

**Installation:**
```bash
npm install @carllee1983/prompt-toolkit
# or
pnpm add @carllee1983/prompt-toolkit
# or
yarn add @carllee1983/prompt-toolkit
```

**For TypeScript examples:**
```bash
npm install -D typescript tsx
# or
pnpm add -D typescript tsx
```

## Example Categories

### By Complexity

- **Beginner**: `basic-usage/` - Simple validation examples
- **Intermediate**: `advanced-scenarios/`, `typescript/` - Custom handling and type safety
- **Advanced**: `integration/`, `real-world/` - Production-ready integrations

### By Use Case

- **Development**: `basic-usage/`, `typescript/` - Local development validation
- **CI/CD**: `ci-cd-integration/`, `real-world/ci-validation-pipeline.js` - Automated validation
- **Integration**: `integration/` - System integrations
- **Monitoring**: `integration/monitoring-integration.js` - Health tracking
- **Batch Processing**: `real-world/batch-validation.js` - Multiple repositories

## Next Steps

After exploring the examples:

1. **Read the Documentation:**
   - [Quick Reference](../../docs/QUICK_REFERENCE.md) - Command and API reference
   - [Use Cases](../../docs/USE_CASES.md) - Common use cases and patterns
   - [Best Practices](../../docs/BEST_PRACTICES.md) - Recommended patterns
   - [Troubleshooting](../../docs/TROUBLESHOOTING.md) - Common issues and solutions

2. **Try the Examples:**
   - Start with `basic-usage/validate-repo.js`
   - Explore `typescript/` for type-safe usage
   - Check `integration/` for system integrations
   - Review `real-world/` for production scenarios

3. **Customize for Your Needs:**
   - Modify examples to match your workflow
   - Combine patterns from different examples
   - Create your own validation logic

4. **Share Your Examples:**
   - Found a useful pattern? Consider contributing!
   - See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines

## Getting Help

- 📖 Check the [main README](../../README.md) for overview
- 🔍 See [Quick Reference](../../docs/QUICK_REFERENCE.md) for API details
- 🐛 Review [Troubleshooting](../../docs/TROUBLESHOOTING.md) for common issues
- 💬 Open an [Issue](https://github.com/CarlLee1983/mcp-prompt-toolkit/issues) for questions

