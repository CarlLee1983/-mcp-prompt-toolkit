import fs from 'fs'
import path from 'path'
import { walkDir } from '../utils/walkDir'
import type { ToolkitError } from '../types/errors'
import { createToolkitError, ERROR_CODE_CONSTANTS } from '../schema/errors'

export interface ValidatePartialsResult {
  success: boolean
  partials?: string[]
  errors?: ToolkitError[]
}

export function validatePartials(repoRoot: string, partialPath?: string): ValidatePartialsResult {
  if (!partialPath) {
    return {
      success: true,
      partials: []
    }
  }

  const fullPath = path.join(repoRoot, partialPath)
  if (!fs.existsSync(fullPath)) {
    return {
      success: false,
      errors: [
        createToolkitError(
          ERROR_CODE_CONSTANTS.PARTIAL_PATH_INVALID,
          `Partials path is invalid: ${fullPath}`,
          undefined,
          { expectedPath: fullPath },
          `Create the partials directory at ${fullPath} or update the registry configuration`
        )
      ]
    }
  }

  return {
    success: true,
    partials: walkDir(fullPath)
  }
}
