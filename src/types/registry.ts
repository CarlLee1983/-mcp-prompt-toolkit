export interface RegistryGroup {
    path: string
    enabled: boolean
    prompts: string[]
  }
  
  export interface RegistryDefinition {
    version: number
    globals?: Record<string, string>
    partials?: {
      enabled: boolean
      path: string
    }
    groups: Record<string, RegistryGroup>
  }
  