import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { loadYaml } from '../utils/loadYaml'
import { RegistrySchema } from '../schema/registry.schema'
import type { ToolkitError } from '../types/errors'
import { createToolkitError } from '../schema/errors'

export interface ValidateRegistryResult {
  success: boolean
  data?: z.infer<typeof RegistrySchema>
  errors?: ToolkitError[]
}

export function validateRegistry(registryPath: string, repoRoot: string): ValidateRegistryResult {
  const parsed = RegistrySchema.safeParse(loadYaml(registryPath))
  if (!parsed.success) {
    const errors: ToolkitError[] = parsed.error.errors.map(err =>
      createToolkitError(
        'REGISTRY_SCHEMA_INVALID',
        `${err.path.join('.')}: ${err.message}`,
        registryPath,
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

  const errors: ToolkitError[] = []
  const { groups } = parsed.data

  for (const [group, def] of Object.entries(groups)) {
    const groupPath = path.join(repoRoot, def.path)
    if (!fs.existsSync(groupPath)) {
      errors.push(
        createToolkitError(
          'REGISTRY_GROUP_NOT_FOUND',
          `Group folder not found: ${group}`,
          registryPath,
          {
            group,
            expectedPath: groupPath
          }
        )
      )
      continue
    }

    for (const prompt of def.prompts) {
      const full = path.join(groupPath, prompt)
      if (!fs.existsSync(full)) {
        errors.push(
          createToolkitError(
            'REGISTRY_PROMPT_NOT_FOUND',
            `Prompt not found: ${group}/${prompt}`,
            registryPath,
            {
              group,
              prompt,
              expectedPath: full
            }
          )
        )
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors
    }
  }

  return {
    success: true,
    data: parsed.data
  }
}
