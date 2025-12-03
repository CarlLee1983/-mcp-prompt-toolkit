import fs from 'fs'
import path from 'path'
import { walkDir } from '../utils/walkDir'
import type { ToolkitError } from '../types/errors'
import { createToolkitError } from '../schema/errors'

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
          'PARTIALS_FOLDER_NOT_FOUND',
          `Partials folder not found: ${fullPath}`,
          undefined,
          { expectedPath: fullPath }
        )
      ]
    }
  }

  return {
    success: true,
    partials: walkDir(fullPath)
  }
}
