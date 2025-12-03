import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { validateRegistry } from '../../src/validators/validateRegistry'
import { TempDir } from '../helpers/tempDir'
import { validRegistryYaml, invalidRegistryYaml } from '../helpers/fixtures'
import { ERROR_CODE_CONSTANTS } from '../../src/schema/errors'

describe('validateRegistry', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('validateRegistry-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Valid registry structure validation', () => {
    it('should be able to validate a valid registry structure', () => {
      const registryPath = tempDir.writeFile('registry.yaml', validRegistryYaml)
      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', 'test')
      tempDir.writeFile('common/code-review.yaml', 'test')
      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', 'test')

      const result = validateRegistry(registryPath, tempDir.getPath())

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.version).toBe(1)
        expect(result.data.groups).toHaveProperty('common')
        expect(result.data.groups).toHaveProperty('laravel')
        expect(result.data.groups.common.enabled).toBe(true)
        expect(result.data.groups.common.prompts).toHaveLength(2)
      }
    })

    it('should be able to parse globals and partials fields', () => {
      const registryPath = tempDir.writeFile('registry.yaml', validRegistryYaml)
      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', 'test')
      tempDir.writeFile('common/code-review.yaml', 'test')
      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', 'test')
      tempDir.mkdir('partials')

      const result = validateRegistry(registryPath, tempDir.getPath())

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.globals).toBeDefined()
        expect(result.data.partials).toBeDefined()
        expect(result.data.partials?.enabled).toBe(true)
        expect(result.data.partials?.path).toBe('partials')
      }
    })
  })

  describe('Schema validation failure', () => {
    it('should return an error when schema validation fails', () => {
      const registryPath = tempDir.writeFile('registry.yaml', invalidRegistryYaml)

      const result = validateRegistry(registryPath, tempDir.getPath())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors!.length).toBeGreaterThan(0)
        expect(result.errors!.some(e => e.code === ERROR_CODE_CONSTANTS.REGISTRY_SCHEMA_INVALID)).toBe(true)
      }
    })
  })

  describe('Group folder does not exist', () => {
    it('should return an error when group folder does not exist', () => {
      const registryPath = tempDir.writeFile('registry.yaml', validRegistryYaml)
      // Do not create common and laravel directories

      const result = validateRegistry(registryPath, tempDir.getPath())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors!.some(e => e.code === ERROR_CODE_CONSTANTS.REGISTRY_GROUP_NOT_FOUND)).toBe(true)
      }
    })
  })

  describe('Prompt file does not exist', () => {
    it('should return an error when prompt file does not exist', () => {
      const registryPath = tempDir.writeFile('registry.yaml', validRegistryYaml)
      tempDir.mkdir('common')
      // Do not create prompt files

      const result = validateRegistry(registryPath, tempDir.getPath())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors!.some(e => e.code === ERROR_CODE_CONSTANTS.REGISTRY_PROMPT_NOT_FOUND)).toBe(true)
      }
    })
  })
})

