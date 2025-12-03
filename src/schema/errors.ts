import type { Severity } from '../types/errors'

// 錯誤碼常數定義（避免拼寫錯誤，提供型別安全）
export const ERROR_CODE_CONSTANTS = {
  // Registry related errors
  REGISTRY_FILE_NOT_FOUND: 'REGISTRY_FILE_NOT_FOUND',
  REGISTRY_SCHEMA_INVALID: 'REGISTRY_SCHEMA_INVALID',
  REGISTRY_GROUP_NOT_FOUND: 'REGISTRY_GROUP_NOT_FOUND',
  REGISTRY_PROMPT_NOT_FOUND: 'REGISTRY_PROMPT_NOT_FOUND',
  REGISTRY_DISABLED_GROUP: 'REGISTRY_DISABLED_GROUP',

  // Prompt file related errors
  PROMPT_SCHEMA_INVALID: 'PROMPT_SCHEMA_INVALID',
  PROMPT_ID_DUPLICATED: 'PROMPT_ID_DUPLICATED',
  PROMPT_ARG_INVALID: 'PROMPT_ARG_INVALID',
  PROMPT_TEMPLATE_EMPTY: 'PROMPT_TEMPLATE_EMPTY',

  // Partials related errors
  PARTIAL_NOT_FOUND: 'PARTIAL_NOT_FOUND',
  PARTIAL_UNUSED: 'PARTIAL_UNUSED',
  PARTIAL_CIRCULAR_DEPENDENCY: 'PARTIAL_CIRCULAR_DEPENDENCY',
  PARTIAL_PATH_INVALID: 'PARTIAL_PATH_INVALID',

  // Repository related errors
  REPO_ROOT_NOT_FOUND: 'REPO_ROOT_NOT_FOUND',
  REPO_STRUCTURE_INVALID: 'REPO_STRUCTURE_INVALID',

  // File related errors
  FILE_READ_FAILED: 'FILE_READ_FAILED',
  FILE_NOT_YAML: 'FILE_NOT_YAML',

  // CLI related errors
  CLI_INVALID_ARGUMENT: 'CLI_INVALID_ARGUMENT',
  CLI_UNKNOWN_COMMAND: 'CLI_UNKNOWN_COMMAND'
} as const

export type ErrorCode = typeof ERROR_CODE_CONSTANTS[keyof typeof ERROR_CODE_CONSTANTS]

export interface ErrorCodeDefinition {
  code: string
  severity: Severity
  defaultMessage: string
}

export const ERROR_CODES: Record<string, ErrorCodeDefinition> = {
  // Registry related errors
  [ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND]: {
    code: ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND,
    severity: 'fatal',
    defaultMessage: 'Registry file not found'
  },
  [ERROR_CODE_CONSTANTS.REGISTRY_SCHEMA_INVALID]: {
    code: ERROR_CODE_CONSTANTS.REGISTRY_SCHEMA_INVALID,
    severity: 'error',
    defaultMessage: 'Registry schema validation failed'
  },
  [ERROR_CODE_CONSTANTS.REGISTRY_GROUP_NOT_FOUND]: {
    code: ERROR_CODE_CONSTANTS.REGISTRY_GROUP_NOT_FOUND,
    severity: 'error',
    defaultMessage: 'Group folder not found'
  },
  [ERROR_CODE_CONSTANTS.REGISTRY_PROMPT_NOT_FOUND]: {
    code: ERROR_CODE_CONSTANTS.REGISTRY_PROMPT_NOT_FOUND,
    severity: 'error',
    defaultMessage: 'Prompt file not found'
  },
  [ERROR_CODE_CONSTANTS.REGISTRY_DISABLED_GROUP]: {
    code: ERROR_CODE_CONSTANTS.REGISTRY_DISABLED_GROUP,
    severity: 'info',
    defaultMessage: 'Group is disabled'
  },

  // Prompt file related errors
  [ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID]: {
    code: ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID,
    severity: 'error',
    defaultMessage: 'Prompt schema validation failed'
  },
  [ERROR_CODE_CONSTANTS.PROMPT_ID_DUPLICATED]: {
    code: ERROR_CODE_CONSTANTS.PROMPT_ID_DUPLICATED,
    severity: 'error',
    defaultMessage: 'Prompt ID is duplicated'
  },
  [ERROR_CODE_CONSTANTS.PROMPT_ARG_INVALID]: {
    code: ERROR_CODE_CONSTANTS.PROMPT_ARG_INVALID,
    severity: 'error',
    defaultMessage: 'Prompt argument validation failed'
  },
  [ERROR_CODE_CONSTANTS.PROMPT_TEMPLATE_EMPTY]: {
    code: ERROR_CODE_CONSTANTS.PROMPT_TEMPLATE_EMPTY,
    severity: 'error',
    defaultMessage: 'Prompt template is empty'
  },

  // Partials related errors
  [ERROR_CODE_CONSTANTS.PARTIAL_NOT_FOUND]: {
    code: ERROR_CODE_CONSTANTS.PARTIAL_NOT_FOUND,
    severity: 'error',
    defaultMessage: 'Partial file not found'
  },
  [ERROR_CODE_CONSTANTS.PARTIAL_UNUSED]: {
    code: ERROR_CODE_CONSTANTS.PARTIAL_UNUSED,
    severity: 'warning',
    defaultMessage: 'Partial file is defined but not used'
  },
  [ERROR_CODE_CONSTANTS.PARTIAL_CIRCULAR_DEPENDENCY]: {
    code: ERROR_CODE_CONSTANTS.PARTIAL_CIRCULAR_DEPENDENCY,
    severity: 'error',
    defaultMessage: 'Circular dependency detected in partials'
  },
  [ERROR_CODE_CONSTANTS.PARTIAL_PATH_INVALID]: {
    code: ERROR_CODE_CONSTANTS.PARTIAL_PATH_INVALID,
    severity: 'error',
    defaultMessage: 'Partials path is invalid'
  },

  // Repository related errors
  [ERROR_CODE_CONSTANTS.REPO_ROOT_NOT_FOUND]: {
    code: ERROR_CODE_CONSTANTS.REPO_ROOT_NOT_FOUND,
    severity: 'fatal',
    defaultMessage: 'Repository root path not found'
  },
  [ERROR_CODE_CONSTANTS.REPO_STRUCTURE_INVALID]: {
    code: ERROR_CODE_CONSTANTS.REPO_STRUCTURE_INVALID,
    severity: 'error',
    defaultMessage: 'Repository structure is invalid'
  },

  // File related errors
  [ERROR_CODE_CONSTANTS.FILE_READ_FAILED]: {
    code: ERROR_CODE_CONSTANTS.FILE_READ_FAILED,
    severity: 'fatal',
    defaultMessage: 'Failed to read file'
  },
  [ERROR_CODE_CONSTANTS.FILE_NOT_YAML]: {
    code: ERROR_CODE_CONSTANTS.FILE_NOT_YAML,
    severity: 'error',
    defaultMessage: 'File is not a valid YAML file'
  },

  // CLI related errors
  [ERROR_CODE_CONSTANTS.CLI_INVALID_ARGUMENT]: {
    code: ERROR_CODE_CONSTANTS.CLI_INVALID_ARGUMENT,
    severity: 'fatal',
    defaultMessage: 'Invalid CLI argument'
  },
  [ERROR_CODE_CONSTANTS.CLI_UNKNOWN_COMMAND]: {
    code: ERROR_CODE_CONSTANTS.CLI_UNKNOWN_COMMAND,
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

