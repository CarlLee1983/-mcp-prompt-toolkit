import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { validatePromptRepo } from '../../src/validators/validateRepo'
import { TempDir } from '../helpers/tempDir'
import { validRegistryYaml, validPromptYaml, invalidPromptYamlMissingId } from '../helpers/fixtures'

describe('validatePromptRepo', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('validateRepo-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Complete valid repository', () => {
    it('should be able to validate a complete valid repository', () => {
      // Create registry.yaml
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      // Create common group
      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', validPromptYaml)
      tempDir.writeFile('common/code-review.yaml', validPromptYaml)

      // Create laravel group
      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Registry validation failure', () => {
    it('should return an error when registry validation fails', () => {
      const invalidRegistry = `
version: 1
groups:
  common:
    path: common
    enabled: true
    # Missing prompts field
`
      tempDir.writeFile('registry.yaml', invalidRegistry)

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Partial prompt file validation failure', () => {
    it('should collect all failed prompt file validations', () => {
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', validPromptYaml)
      tempDir.writeFile('common/code-review.yaml', invalidPromptYamlMissingId)

      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].file).toBe('code-review.yaml')
      expect(result.errors[0].errors).toBeDefined()
    })

    it('should collect all errors when there are multiple validation failures', () => {
      tempDir.writeFile('registry.yaml', validRegistryYaml)

      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', invalidPromptYamlMissingId)
      tempDir.writeFile('common/code-review.yaml', invalidPromptYamlMissingId)

      tempDir.mkdir('laravel')
      tempDir.writeFile('laravel/laravel-api-implementation.yaml', validPromptYaml)

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Skipping disabled groups', () => {
    it('should skip disabled groups', () => {
      const registryWithDisabledGroup = `
version: 1
groups:
  common:
    path: common
    enabled: true
    prompts:
      - api-design.yaml
  disabled:
    path: disabled
    enabled: false
    prompts:
      - test.yaml
`
      tempDir.writeFile('registry.yaml', registryWithDisabledGroup)

      tempDir.mkdir('common')
      tempDir.writeFile('common/api-design.yaml', validPromptYaml)

      // Need to create disabled group directory and files (validateRegistry checks all groups)
      // But validatePromptRepo will skip prompt content validation for disabled groups
      tempDir.mkdir('disabled')
      tempDir.writeFile('disabled/test.yaml', 'invalid content')

      const result = validatePromptRepo(tempDir.getPath())

      expect(result.passed).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})

