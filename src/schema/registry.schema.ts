import { z } from 'zod'

export const RegistrySchema = z.object({
  version: z.number(),
  globals: z.record(z.string(), z.string()).optional(),
  partials: z.object({
    enabled: z.boolean(),
    path: z.string()
  }).optional(),
  groups: z.record(z.string(), z.object({
    path: z.string(),
    enabled: z.boolean(),
    prompts: z.array(z.string())
  }))
})
