import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { walkDir } from '../../src/utils/walkDir'
import { TempDir } from '../helpers/tempDir'

describe('walkDir', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('walkDir-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Single-level directory scanning', () => {
    it('should be able to scan all files in a single-level directory', () => {
      tempDir.writeFile('file1.txt', 'content1')
      tempDir.writeFile('file2.txt', 'content2')
      tempDir.writeFile('file3.txt', 'content3')

      const results = walkDir(tempDir.getPath())

      expect(results).toHaveLength(3)
      expect(results.some(f => f.endsWith('file1.txt'))).toBe(true)
      expect(results.some(f => f.endsWith('file2.txt'))).toBe(true)
      expect(results.some(f => f.endsWith('file3.txt'))).toBe(true)
    })
  })

  describe('Multi-level nested directory scanning', () => {
    it('should be able to recursively scan nested directories', () => {
      tempDir.writeFile('root.txt', 'root content')
      tempDir.mkdir('subdir1')
      tempDir.writeFile('subdir1/file1.txt', 'subdir1 content')
      tempDir.mkdir('subdir1/nested')
      tempDir.writeFile('subdir1/nested/file2.txt', 'nested content')
      tempDir.mkdir('subdir2')
      tempDir.writeFile('subdir2/file3.txt', 'subdir2 content')

      const results = walkDir(tempDir.getPath())

      expect(results).toHaveLength(4)
      expect(results.some(f => f.endsWith('root.txt'))).toBe(true)
      expect(results.some(f => f.endsWith('subdir1/file1.txt'))).toBe(true)
      expect(results.some(f => f.endsWith('subdir1/nested/file2.txt'))).toBe(true)
      expect(results.some(f => f.endsWith('subdir2/file3.txt'))).toBe(true)
    })
  })

  describe('Empty directory handling', () => {
    it('should return an empty array for empty directory', () => {
      const results = walkDir(tempDir.getPath())

      expect(results).toHaveLength(0)
      expect(results).toEqual([])
    })
  })

  describe('Mixed files and directories', () => {
    it('should only return files, not directories', () => {
      tempDir.writeFile('file1.txt', 'content1')
      tempDir.mkdir('subdir')
      tempDir.writeFile('subdir/file2.txt', 'content2')

      const results = walkDir(tempDir.getPath())

      expect(results).toHaveLength(2)
      expect(results.every(f => f.endsWith('.txt'))).toBe(true)
      expect(results.some(f => f.endsWith('file1.txt'))).toBe(true)
      expect(results.some(f => f.endsWith('file2.txt'))).toBe(true)
    })
  })
})

