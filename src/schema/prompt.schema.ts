import { z } from 'zod'

export const PromptArgSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'object']),
  description: z.string().optional(),
  required: z.boolean().optional(),
  default: z.any().optional()
})

export const PromptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  args: z.record(z.string(), PromptArgSchema),
  template: z.string().min(1)
})
