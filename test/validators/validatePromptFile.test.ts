import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { validatePromptFile } from '../../src/validators/validatePromptFile'
import { TempDir } from '../helpers/tempDir'
import {
  validPromptYaml,
  invalidPromptYamlMissingId,
  invalidPromptYamlInvalidArgType,
  invalidYamlSyntax
} from '../helpers/fixtures'
import { ERROR_CODE_CONSTANTS } from '../../src/schema/errors'

describe('validatePromptFile', () => {
  let tempDir: TempDir

  beforeEach(() => {
    tempDir = new TempDir('validatePromptFile-test-')
  })

  afterEach(() => {
    tempDir.cleanup()
  })

  describe('Valid prompt file validation', () => {
    it('should be able to validate a valid prompt file', () => {
      const filePath = tempDir.writeFile('valid-prompt.yaml', validPromptYaml)

      const result = validatePromptFile(filePath)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('test-prompt')
        expect(result.data.title).toBe('Test Prompt')
        expect(result.data.description).toBe('This is a test prompt')
        expect(result.data.args).toHaveProperty('name')
        expect(result.data.args).toHaveProperty('count')
        expect(result.data.template).toContain('Hello {{name}}')
      }
    })

    it('should be able to correctly parse args field', () => {
      const filePath = tempDir.writeFile('valid-prompt.yaml', validPromptYaml)

      const result = validatePromptFile(filePath)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.args.name.type).toBe('string')
        expect(result.data.args.name.required).toBe(true)
        expect(result.data.args.count.type).toBe('number')
        expect(result.data.args.count.default).toBe(10)
      }
    })
  })

  describe('Invalid prompt file validation', () => {
    it('should fail validation when required fields are missing', () => {
      const filePath = tempDir.writeFile('invalid-prompt.yaml', invalidPromptYamlMissingId)

      const result = validatePromptFile(filePath)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors!.length).toBeGreaterThan(0)
        expect(result.errors!.some(e => e.code === ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID)).toBe(true)
        expect(result.errors!.some(e => 
          e.meta && Array.isArray(e.meta.path) && e.meta.path.includes('id')
        )).toBe(true)
      }
    })

    it('should fail validation when args type is invalid', () => {
      const filePath = tempDir.writeFile('invalid-arg-type.yaml', invalidPromptYamlInvalidArgType)

      const result = validatePromptFile(filePath)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors!.length).toBeGreaterThan(0)
        expect(result.errors!.some(e => 
          e.code === ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID && (
            (e.meta && Array.isArray(e.meta.path) && e.meta.path.includes('args')) ||
            e.message.includes('enum')
          )
        )).toBe(true)
      }
    })

    it('should return error when YAML format is invalid', () => {
      const filePath = tempDir.writeFile('invalid-yaml.yaml', invalidYamlSyntax)

      const result = validatePromptFile(filePath)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors!.some(e => 
          e.code === ERROR_CODE_CONSTANTS.FILE_NOT_YAML || e.code === ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID
        )).toBe(true)
      }
    })
  })

  describe('File does not exist', () => {
    it('should return error when file does not exist', () => {
      const nonExistentPath = tempDir.getPath() + '/non-existent.yaml'

      const result = validatePromptFile(nonExistentPath)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors!.some(e => 
          e.code === ERROR_CODE_CONSTANTS.FILE_READ_FAILED || e.code === ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID
        )).toBe(true)
      }
    })

    it('should detect empty template', () => {
      const promptWithEmptyTemplate = `
id: test-empty
title: Test Empty
description: Test
args:
  name:
    type: string
template: "   "
`
      const filePath = tempDir.writeFile('empty-template.yaml', promptWithEmptyTemplate)

      const result = validatePromptFile(filePath)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors!.some(e => e.code === ERROR_CODE_CONSTANTS.PROMPT_TEMPLATE_EMPTY)).toBe(true)
      }
    })
  })
})

