import { z } from 'zod'
import { loadYaml } from '../utils/loadYaml'
import { PromptSchema } from '../schema/prompt.schema'
import type { ToolkitError } from '../types/errors'
import { createToolkitError } from '../schema/errors'

export interface ValidatePromptFileResult {
  success: boolean
  data?: z.infer<typeof PromptSchema>
  errors?: ToolkitError[]
}

export function validatePromptFile(filePath: string): ValidatePromptFileResult {
  const data = loadYaml(filePath)
  const result = PromptSchema.safeParse(data)
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    }
  }

  const errors: ToolkitError[] = result.error.errors.map(err => 
    createToolkitError(
      'PROMPT_SCHEMA_INVALID',
      `${err.path.join('.')}: ${err.message}`,
      filePath,
      {
        path: err.path,
        message: err.message,
        code: err.code
      }
    )
  )

  return {
    success: false,
    errors
  }
}
