import type { Severity } from '../types/errors'

export interface ErrorCodeDefinition {
  code: string
  severity: Severity
  defaultMessage: string
}

export const ERROR_CODES: Record<string, ErrorCodeDefinition> = {
  // Registry related errors
  REGISTRY_FILE_NOT_FOUND: {
    code: 'REGISTRY_FILE_NOT_FOUND',
    severity: 'fatal',
    defaultMessage: 'Registry file not found'
  },
  REGISTRY_SCHEMA_INVALID: {
    code: 'REGISTRY_SCHEMA_INVALID',
    severity: 'error',
    defaultMessage: 'Registry schema validation failed'
  },
  REGISTRY_GROUP_NOT_FOUND: {
    code: 'REGISTRY_GROUP_NOT_FOUND',
    severity: 'error',
    defaultMessage: 'Group folder not found'
  },
  REGISTRY_PROMPT_NOT_FOUND: {
    code: 'REGISTRY_PROMPT_NOT_FOUND',
    severity: 'error',
    defaultMessage: 'Prompt file not found'
  },
  REGISTRY_DISABLED_GROUP: {
    code: 'REGISTRY_DISABLED_GROUP',
    severity: 'info',
    defaultMessage: 'Group is disabled'
  },

  // Prompt file related errors
  PROMPT_SCHEMA_INVALID: {
    code: 'PROMPT_SCHEMA_INVALID',
    severity: 'error',
    defaultMessage: 'Prompt schema validation failed'
  },
  PROMPT_ID_DUPLICATED: {
    code: 'PROMPT_ID_DUPLICATED',
    severity: 'error',
    defaultMessage: 'Prompt ID is duplicated'
  },
  PROMPT_ARG_INVALID: {
    code: 'PROMPT_ARG_INVALID',
    severity: 'error',
    defaultMessage: 'Prompt argument validation failed'
  },
  PROMPT_TEMPLATE_EMPTY: {
    code: 'PROMPT_TEMPLATE_EMPTY',
    severity: 'error',
    defaultMessage: 'Prompt template is empty'
  },

  // Partials related errors
  PARTIAL_NOT_FOUND: {
    code: 'PARTIAL_NOT_FOUND',
    severity: 'error',
    defaultMessage: 'Partial file not found'
  },
  PARTIAL_UNUSED: {
    code: 'PARTIAL_UNUSED',
    severity: 'warning',
    defaultMessage: 'Partial file is defined but not used'
  },
  PARTIAL_CIRCULAR_DEPENDENCY: {
    code: 'PARTIAL_CIRCULAR_DEPENDENCY',
    severity: 'error',
    defaultMessage: 'Circular dependency detected in partials'
  },
  PARTIAL_PATH_INVALID: {
    code: 'PARTIAL_PATH_INVALID',
    severity: 'error',
    defaultMessage: 'Partials path is invalid'
  },

  // Repository related errors
  REPO_ROOT_NOT_FOUND: {
    code: 'REPO_ROOT_NOT_FOUND',
    severity: 'fatal',
    defaultMessage: 'Repository root path not found'
  },
  REPO_STRUCTURE_INVALID: {
    code: 'REPO_STRUCTURE_INVALID',
    severity: 'error',
    defaultMessage: 'Repository structure is invalid'
  },

  // File related errors
  FILE_READ_FAILED: {
    code: 'FILE_READ_FAILED',
    severity: 'fatal',
    defaultMessage: 'Failed to read file'
  },
  FILE_NOT_YAML: {
    code: 'FILE_NOT_YAML',
    severity: 'error',
    defaultMessage: 'File is not a valid YAML file'
  },

  // CLI related errors
  CLI_INVALID_ARGUMENT: {
    code: 'CLI_INVALID_ARGUMENT',
    severity: 'fatal',
    defaultMessage: 'Invalid CLI argument'
  },
  CLI_UNKNOWN_COMMAND: {
    code: 'CLI_UNKNOWN_COMMAND',
    severity: 'fatal',
    defaultMessage: 'Unknown CLI command'
  }
}

export function getErrorCodeDefinition(code: string): ErrorCodeDefinition | undefined {
  return ERROR_CODES[code]
}

export function createToolkitError(
  code: string,
  message?: string,
  file?: string,
  meta?: Record<string, unknown>,
  hint?: string
): import('../types/errors').ToolkitError {
  const definition = getErrorCodeDefinition(code)
  if (!definition) {
    throw new Error(`Unknown error code: ${code}`)
  }

  return {
    code,
    severity: definition.severity,
    message: message || definition.defaultMessage,
    file,
    meta,
    hint
  }
}

