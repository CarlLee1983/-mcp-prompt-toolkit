import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { validatePartials } from '../../src/validators/validatePartials'
import { TempDir } from '../helpers/tempDir'

describe('validatePartials', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('validatePartials-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Valid partials path', () => {
    it('should be able to validate a valid partials path', () => {
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/role-expert.hbs', 'content1')
      tempDir.writeFile('partials/role-helper.hbs', 'content2')

      const result = validatePartials(tempDir.getPath(), 'partials')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.partials).toHaveLength(2)
        expect(result.partials!.some(f => f.endsWith('role-expert.hbs'))).toBe(true)
        expect(result.partials!.some(f => f.endsWith('role-helper.hbs'))).toBe(true)
      }
    })

    it('should be able to recursively scan nested directories', () => {
      tempDir.mkdir('partials')
      tempDir.writeFile('partials/role-expert.hbs', 'content1')
      tempDir.mkdir('partials/nested')
      tempDir.writeFile('partials/nested/helper.hbs', 'content2')

      const result = validatePartials(tempDir.getPath(), 'partials')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.partials).toHaveLength(2)
        expect(result.partials!.some(f => f.endsWith('role-expert.hbs'))).toBe(true)
        expect(result.partials!.some(f => f.endsWith('helper.hbs'))).toBe(true)
      }
    })
  })

  describe('Partials path is undefined', () => {
    it('should return an empty array when partials path is undefined', () => {
      const result = validatePartials(tempDir.getPath(), undefined)

      expect(result.success).toBe(true)
      expect(result.partials).toEqual([])
      expect(result.partials).toHaveLength(0)
    })
  })

  describe('Partials folder does not exist', () => {
    it('should return an error when partials folder does not exist', () => {
      const result = validatePartials(tempDir.getPath(), 'non-existent-partials')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors!.some(e => e.code === 'PARTIALS_FOLDER_NOT_FOUND')).toBe(true)
      }
    })
  })
})

