import fs from 'fs'
import path from 'path'

export function walkDir(dir: string): string[] {
  const results: string[] = []
  const list = fs.readdirSync(dir)

  for (const file of list) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      results.push(...walkDir(full))
    } else {
      results.push(full)
    }
  }
  return results
}
