export interface PromptArg {
    type: 'string' | 'number' | 'boolean' | 'object'
    description?: string
    required?: boolean
    default?: unknown
  }
  
  export interface PromptDefinition {
    id: string
    title: string
    description: string
    args: Record<string, PromptArg>
    template: string
  }
  