import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { loadYaml } from '../utils/loadYaml'
import { RegistrySchema } from '../schema/registry.schema'
import type { ToolkitError } from '../types/errors'
import { createToolkitError, ERROR_CODE_CONSTANTS } from '../schema/errors'

export interface ValidateRegistryResult {
  success: boolean
  data?: z.infer<typeof RegistrySchema>
  errors?: ToolkitError[]
}

export function validateRegistry(registryPath: string, repoRoot: string): ValidateRegistryResult {
  // Check if registry file exists
  if (!fs.existsSync(registryPath)) {
    return {
      success: false,
      errors: [
        createToolkitError(
          ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND,
          `Registry file not found: ${registryPath}`,
          registryPath,
          { expectedPath: registryPath },
          'Ensure the registry.yaml file exists in the repository root'
        )
      ]
    }
  }

  // Explicitly define the expected shape since Zod inference might be tricky with v4
  interface GroupDef {
    path: string
    enabled: boolean
    prompts: string[]
  }

  let parsed: { success: true; data: z.infer<typeof RegistrySchema> } | { success: false; error: z.ZodError }

  try {
    parsed = RegistrySchema.safeParse(loadYaml(registryPath))
  } catch (error) {
    // loadYaml will throw FILE_READ_FAILED or FILE_NOT_YAML
    // We need to catch and convert to appropriate error
    return {
      success: false,
      errors: [
        createToolkitError(
          ERROR_CODE_CONSTANTS.REGISTRY_SCHEMA_INVALID,
          error instanceof Error ? error.message : 'Failed to load registry file',
          registryPath,
          { originalError: String(error) },
          'Check that the registry.yaml file is valid YAML and readable'
        )
      ]
    }
  }

  if (!parsed.success) {
    const errors: ToolkitError[] = parsed.error.issues.map((err: z.ZodIssue) =>
      createToolkitError(
        ERROR_CODE_CONSTANTS.REGISTRY_SCHEMA_INVALID,
        `${err.path.join('.')}: ${err.message}`,
        registryPath,
        {
          path: err.path,
          message: err.message,
          code: err.code
        },
        'Refer to the registry schema documentation for valid structure'
      )
    )
    return {
      success: false,
      errors
    }
  }

  const errors: ToolkitError[] = []
  const { groups } = parsed.data

  for (const [group, rawDef] of Object.entries(groups)) {
    const def = rawDef as GroupDef
    if (!def.enabled) {
      // Skip disabled groups, but could add info level error if needed
      continue
    }

    const groupPath = path.join(repoRoot, def.path)
    if (!fs.existsSync(groupPath)) {
      errors.push(
        createToolkitError(
          ERROR_CODE_CONSTANTS.REGISTRY_GROUP_NOT_FOUND,
          `Group folder not found: ${group}`,
          registryPath,
          {
            group,
            expectedPath: groupPath
          },
          `Create the directory at ${groupPath} or update the registry path`
        )
      )
      continue
    }

    for (const prompt of def.prompts) {
      const full = path.join(groupPath, prompt)
      if (!fs.existsSync(full)) {
        errors.push(
          createToolkitError(
            ERROR_CODE_CONSTANTS.REGISTRY_PROMPT_NOT_FOUND,
            `Prompt not found: ${group}/${prompt}`,
            registryPath,
            {
              group,
              prompt,
              expectedPath: full
            },
            `Create the prompt file at ${full} or remove it from the registry`
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
