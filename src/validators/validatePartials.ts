import fs from 'fs'
import path from 'path'
import { walkDir } from '../utils/walkDir'

export function validatePartials(repoRoot: string, partialPath?: string) {
  if (!partialPath) return []

  const fullPath = path.join(repoRoot, partialPath)
  if (!fs.existsSync(fullPath)) {
    throw new Error('Partials folder not found')
  }

  return walkDir(fullPath)
}
