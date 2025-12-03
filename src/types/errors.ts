export type Severity = 'error' | 'warning' | 'info' | 'debug'

export interface ToolkitError {
  code: string
  severity: Severity
  message: string
  file?: string
  details?: Record<string, unknown>
}

