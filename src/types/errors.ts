export type Severity = 'fatal' | 'error' | 'warning' | 'info'

export interface ToolkitError {
  code: string
  severity: Severity
  message: string
  file?: string
  hint?: string
  meta?: Record<string, unknown>
}

