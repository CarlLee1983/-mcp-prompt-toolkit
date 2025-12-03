import fs from 'fs'
import yaml from 'js-yaml'

export function loadYaml<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf8')
  return yaml.load(raw) as T
}
