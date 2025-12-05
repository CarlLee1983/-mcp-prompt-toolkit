import { z } from 'zod'
import { loadYaml } from '../utils/loadYaml'
import { PromptSchema } from '../schema/prompt.schema'
import type { ToolkitError } from '../types/errors'
import { createToolkitError, ERROR_CODE_CONSTANTS } from '../schema/errors'

export interface ValidatePromptFileResult {
  success: boolean
  data?: z.infer<typeof PromptSchema>
  errors?: ToolkitError[]
}

export function validatePromptFile(filePath: string): ValidatePromptFileResult {
  let data: unknown
  try {
    data = loadYaml(filePath)
  } catch (error) {
    // loadYaml will throw FILE_READ_FAILED or FILE_NOT_YAML
    // We need to catch and convert to appropriate error
    return {
      success: false,
      errors: [
        createToolkitError(
          ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID,
          error instanceof Error ? error.message : 'Failed to load prompt file',
          filePath,
          { originalError: String(error) },
          'Check that the file is valid YAML and readable'
        )
      ]
    }
  }

  const result = PromptSchema.safeParse(data)

  if (!result.success) {
    const errors: ToolkitError[] = result.error.issues.map((err: z.ZodIssue) =>
      createToolkitError(
        ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID,
        `${err.path.join('.')}: ${err.message}`,
        filePath,
        {
          path: err.path,
          message: err.message,
          code: err.code
        },
        'Refer to the prompt schema documentation for valid structure'
      )
    )
    return {
      success: false,
      errors
    }
  }

  // Check if template is empty
  const errors: ToolkitError[] = []
  if (!result.data.template || result.data.template.trim().length === 0) {
    errors.push(
      createToolkitError(
        ERROR_CODE_CONSTANTS.PROMPT_TEMPLATE_EMPTY,
        'Prompt template is empty',
        filePath,
        { promptId: result.data.id },
        'Add template content to the prompt file'
      )
    )
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors
    }
  }

  return {
    success: true,
    data: result.data
  }
}
