import fs from 'fs'
import path from 'path'
import { loadYaml } from '../utils/loadYaml'
import { RegistrySchema } from '../schema/registry.schema'

export function validateRegistry(registryPath: string, repoRoot: string) {
  const parsed = RegistrySchema.safeParse(loadYaml(registryPath))
  if (!parsed.success) return parsed

  const { groups } = parsed.data

  for (const [group, def] of Object.entries(groups)) {
    const groupPath = path.join(repoRoot, def.path)
    if (!fs.existsSync(groupPath)) {
      throw new Error(`Group folder not found: ${group}`)
    }

    for (const prompt of def.prompts) {
      const full = path.join(groupPath, prompt)
      if (!fs.existsSync(full)) {
        throw new Error(`Prompt not found: ${group}/${prompt}`)
      }
    }
  }

  return parsed
}
