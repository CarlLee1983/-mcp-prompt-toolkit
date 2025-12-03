import fs from 'fs'
import yaml from 'js-yaml'
import { createToolkitError, ERROR_CODE_CONSTANTS } from '../schema/errors'

export function loadYaml<T>(filePath: string): T {
  let raw: string
  try {
    raw = fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    throw createToolkitError(
      ERROR_CODE_CONSTANTS.FILE_READ_FAILED,
      `Failed to read file: ${filePath}`,
      filePath,
      { originalError: error instanceof Error ? error.message : String(error) },
      'Check that the file exists and you have read permissions'
    )
  }

  try {
    return yaml.load(raw) as T
  } catch (error) {
    throw createToolkitError(
      ERROR_CODE_CONSTANTS.FILE_NOT_YAML,
      `File is not a valid YAML file: ${filePath}`,
      filePath,
      { originalError: error instanceof Error ? error.message : String(error) },
      'Check that the file contains valid YAML syntax'
    )
  }
}
