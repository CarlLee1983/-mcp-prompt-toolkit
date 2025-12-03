import fs from 'fs'
import path from 'path'
import os from 'os'

/**
 * Temporary directory management utility
 */
export class TempDir {
  private dirPath: string

  constructor(prefix: string = 'test-') {
    this.dirPath = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  }

  /**
   * Get the temporary directory path
   */
  getPath(): string {
    return this.dirPath
  }

  /**
   * Create a file
   */
  writeFile(filePath: string, content: string): string {
    const fullPath = path.join(this.dirPath, filePath)
    const dir = path.dirname(fullPath)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(fullPath, content, 'utf8')
    return fullPath
  }

  /**
   * Create a directory
   */
  mkdir(dirPath: string): string {
    const fullPath = path.join(this.dirPath, dirPath)
    fs.mkdirSync(fullPath, { recursive: true })
    return fullPath
  }

  /**
   * Check if a file exists
   */
  exists(filePath: string): boolean {
    const fullPath = path.join(this.dirPath, filePath)
    return fs.existsSync(fullPath)
  }

  /**
   * Clean up the temporary directory
   */
  cleanup(): void {
    if (fs.existsSync(this.dirPath)) {
      fs.rmSync(this.dirPath, { recursive: true, force: true })
    }
  }
}

