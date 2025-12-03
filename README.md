# @mcp/prompt-toolkit

<div align="center">

**Prompt repository governance toolkit for MCP**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/CarlLee1983/prompts-tooling-sdk)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

## 📋 Introduction

`@mcp/prompt-toolkit` is a TypeScript toolkit designed for validating and managing prompt repositories used with Model Context Protocol (MCP). It provides comprehensive validation for registry files, prompt definitions, and partials directories, ensuring the integrity and correctness of prompt repositories.

## ✨ Features

- **Registry Validation**: Validate `registry.yaml` structure and ensure all referenced files exist
- **Prompt File Validation**: Validate individual prompt YAML files against schema definitions
- **Partials Validation**: Validate partials directory structure and file existence
- **Repository Validation**: Complete repository validation workflow that validates all components
- **Type Safety**: Full TypeScript support with type definitions
- **Schema Validation**: Zod-based schema validation for robust type checking
- **Comprehensive Testing**: 28 unit tests with 100% coverage

## 🚀 Installation

```bash
# Using npm
npm install @mcp/prompt-toolkit

# Using pnpm
pnpm add @mcp/prompt-toolkit

# Using yarn
yarn add @mcp/prompt-toolkit
```

## 📖 Usage

### Basic Example

```typescript
import { validatePromptRepo } from '@mcp/prompt-toolkit'

// Validate entire repository
const result = validatePromptRepo('/path/to/prompt-repo')

if (result.passed) {
  console.log('Repository validation passed!')
} else {
  console.error('Validation errors:', result.errors)
}
```

### Validate Registry

```typescript
import { validateRegistry } from '@mcp/prompt-toolkit'

const result = validateRegistry('/path/to/registry.yaml', '/path/to/repo-root')

if (result.success) {
  console.log('Registry is valid:', result.data)
} else {
  console.error('Registry validation failed:', result.error)
}
```

### Validate Prompt File

```typescript
import { validatePromptFile } from '@mcp/prompt-toolkit'

const result = validatePromptFile('/path/to/prompt.yaml')

if (result.success) {
  console.log('Prompt is valid:', result.data)
} else {
  console.error('Prompt validation failed:', result.error)
}
```

### Validate Partials

```typescript
import { validatePartials } from '@mcp/prompt-toolkit'

// Returns array of partial file paths, or empty array if partialPath is undefined
const partials = validatePartials('/path/to/repo-root', 'partials')

console.log('Found partials:', partials)
```

## 📚 API Reference

### `validatePromptRepo(repoRoot: string)`

Validates the entire prompt repository, including registry, all prompt files, and partials.

**Parameters:**
- `repoRoot`: Path to the repository root directory

**Returns:**
```typescript
{
  passed: boolean
  errors: Array<{ file: string; errors: ZodError }>
}
```

### `validateRegistry(registryPath: string, repoRoot: string)`

Validates the registry.yaml file structure and ensures all referenced groups and prompts exist.

**Parameters:**
- `registryPath`: Path to the registry.yaml file
- `repoRoot`: Path to the repository root directory

**Returns:**
```typescript
ZodSafeParseReturnType<RegistryDefinition>
```

**Throws:**
- `Error` if group folders or prompt files are missing

### `validatePromptFile(filePath: string)`

Validates a single prompt YAML file against the prompt schema.

**Parameters:**
- `filePath`: Path to the prompt YAML file

**Returns:**
```typescript
ZodSafeParseReturnType<PromptDefinition>
```

### `validatePartials(repoRoot: string, partialPath?: string)`

Validates and returns all partial files in the specified directory.

**Parameters:**
- `repoRoot`: Path to the repository root directory
- `partialPath`: Optional path to the partials directory (relative to repoRoot)

**Returns:**
```typescript
string[] // Array of file paths
```

**Throws:**
- `Error` if partials folder does not exist (when partialPath is provided)

## 📝 Schema Definitions

### Registry Schema

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

### Prompt Schema

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

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Generate coverage report
pnpm test:coverage
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Build in watch mode
pnpm dev

# Run linter
pnpm lint
```

## 📦 Project Structure

```
prompts-tooling-sdk/
├── src/
│   ├── index.ts              # Main entry point
│   ├── validators/           # Validation functions
│   │   ├── validateRepo.ts
│   │   ├── validateRegistry.ts
│   │   ├── validatePromptFile.ts
│   │   └── validatePartials.ts
│   ├── schema/               # Zod schemas
│   │   ├── registry.schema.ts
│   │   └── prompt.schema.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── registry.ts
│   │   └── prompt.ts
│   └── utils/                # Utility functions
│       ├── loadYaml.ts
│       └── walkDir.ts
├── test/                     # Test files
├── dist/                     # Build output
└── package.json
```

## 📄 License

ISC

## 👤 Author

CarlLee1983

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 Changelog

### [0.1.0] - Initial Release

- Initial release of prompts-tooling-sdk
- Registry validation functionality
- Prompt file validation functionality
- Partials directory validation functionality
- Complete repository validation workflow
- YAML loading and directory scanning utilities
- Comprehensive unit test suite (28 test cases)
- TypeScript project configuration and build setup

