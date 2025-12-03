import { loadYaml } from '../utils/loadYaml'
import { PromptSchema } from '../schema/prompt.schema'

export function validatePromptFile(filePath: string) {
  const data = loadYaml(filePath)
  return PromptSchema.safeParse(data)
}
