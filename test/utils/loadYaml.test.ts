import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadYaml } from '../../src/utils/loadYaml'
import { TempDir } from '../helpers/tempDir'
import { validRegistryYaml, invalidYamlSyntax } from '../helpers/fixtures'

describe('loadYaml', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('loadYaml-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Successfully load YAML files', () => {
    it('should be able to load a valid YAML file', () => {
      const filePath = tempDir.writeFile('test.yaml', validRegistryYaml)

      const result = loadYaml(filePath)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('version')
      expect(result).toHaveProperty('groups')
    })

    it('should be able to correctly parse YAML content', () => {
      const yamlContent = `
version: 1
name: test
enabled: true
`
      const filePath = tempDir.writeFile('test.yaml', yamlContent)

      const result = loadYaml<{ version: number; name: string; enabled: boolean }>(filePath)

      expect(result.version).toBe(1)
      expect(result.name).toBe('test')
      expect(result.enabled).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('should throw an error when file does not exist', () => {
      const nonExistentPath = tempDir.getPath() + '/non-existent.yaml'

      expect(() => {
        loadYaml(nonExistentPath)
      }).toThrow()
    })

    it('should throw an error when YAML format is invalid', () => {
      const filePath = tempDir.writeFile('invalid.yaml', invalidYamlSyntax)

      expect(() => {
        loadYaml(filePath)
      }).toThrow()
    })
  })
})

