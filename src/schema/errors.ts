import type { Severity } from '../types/errors'

export interface ErrorCodeDefinition {
  code: string
  severity: Severity
  defaultMessage: string
}

export const ERROR_CODES: Record<string, ErrorCodeDefinition> = {
  // Registry related errors
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

  // Prompt file related errors
  PROMPT_SCHEMA_INVALID: {
    code: 'PROMPT_SCHEMA_INVALID',
    severity: 'error',
    defaultMessage: 'Prompt schema validation failed'
  },
  PROMPT_FILE_NOT_FOUND: {
    code: 'PROMPT_FILE_NOT_FOUND',
    severity: 'error',
    defaultMessage: 'Prompt file not found'
  },

  // Partials related errors
  PARTIAL_MISSING: {
    code: 'PARTIAL_MISSING',
    severity: 'error',
    defaultMessage: 'Partial file not found'
  },
  PARTIAL_CIRCULAR: {
    code: 'PARTIAL_CIRCULAR',
    severity: 'error',
    defaultMessage: 'Circular dependency detected in partials'
  },
  PARTIAL_UNUSED: {
    code: 'PARTIAL_UNUSED',
    severity: 'warning',
    defaultMessage: 'Partial file is defined but not used'
  },
  PARTIALS_FOLDER_NOT_FOUND: {
    code: 'PARTIALS_FOLDER_NOT_FOUND',
    severity: 'error',
    defaultMessage: 'Partials folder not found'
  },

  // Repository related errors
  REPO_PATH_NOT_FOUND: {
    code: 'REPO_PATH_NOT_FOUND',
    severity: 'error',
    defaultMessage: 'Repository path not found'
  },
  REPO_REGISTRY_NOT_FOUND: {
    code: 'REPO_REGISTRY_NOT_FOUND',
    severity: 'error',
    defaultMessage: 'Registry file not found'
  }
}

export function getErrorCodeDefinition(code: string): ErrorCodeDefinition | undefined {
  return ERROR_CODES[code]
}

export function createToolkitError(
  code: string,
  message?: string,
  file?: string,
  details?: Record<string, unknown>
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
    details
  }
}

