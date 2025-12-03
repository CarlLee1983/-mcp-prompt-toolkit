import fs from 'fs'
import path from 'path'
import { extractPartials } from '../partials/extractPartials'
import { resolvePartialPath } from '../partials/resolvePartialPath'
import { buildPartialGraph } from '../partials/buildPartialGraph'
import { detectCircular } from '../partials/detectCircular'
import { walkDir } from '../utils/walkDir'
import type { ToolkitError } from '../types/errors'
import { createToolkitError } from '../schema/errors'

export interface ValidatePartialsUsageOptions {
  checkUnused?: boolean
  file?: string
}

export function validatePartialsUsage(
  template: string,
  partialRoot: string,
  options: ValidatePartialsUsageOptions = {}
): ToolkitError[] {
  const used = extractPartials(template)
  const errors: ToolkitError[] = []
  const graph = new Map<string, string[]>()

  function buildGraphRecursive(partialName: string) {
    const file = resolvePartialPath(partialRoot, partialName)
    if (!file) {
      return
    }

    if (graph.has(file)) {
      return
    }

    buildPartialGraph(file, graph)

    // Recursively build graph for dependencies
    const deps = graph.get(file) || []
    for (const dep of deps) {
      buildGraphRecursive(dep)
    }
  }

  for (const name of used) {
    const file = resolvePartialPath(partialRoot, name)
    if (!file) {
      errors.push(
        createToolkitError(
          'PARTIAL_MISSING',
          `Partial file not found: ${name}`,
          options.file,
          { partial: name }
        )
      )
      continue
    }

    buildGraphRecursive(name)
  }

  // Convert graph to use file paths consistently for cycle detection
  const fileGraph = new Map<string, string[]>()
  for (const [filePath, depNames] of graph.entries()) {
    const fileDeps = depNames
      .map(name => resolvePartialPath(partialRoot, name))
      .filter((f): f is string => f !== null)
    fileGraph.set(filePath, fileDeps)
  }

  const cycles = detectCircular(fileGraph)
  for (const c of cycles) {
    // Convert file paths back to partial names for error reporting
    const partialNames = c.map(filePath => {
      const name = filePath.replace(partialRoot + '/', '').replace('.hbs', '')
      return name
    })
    errors.push(
      createToolkitError(
        'PARTIAL_CIRCULAR',
        `Circular dependency detected: ${partialNames.join(' → ')}`,
        options.file,
        { chain: partialNames }
      )
    )
  }

  // Check for unused partials if enabled
  if (options.checkUnused) {
    const allPartials = getAllPartials(partialRoot)
    const usedSet = new Set(used)
    
    for (const partial of allPartials) {
      if (!usedSet.has(partial)) {
        errors.push(
          createToolkitError(
            'PARTIAL_UNUSED',
            `Partial file is defined but not used: ${partial}`,
            options.file,
            { partial }
          )
        )
      }
    }
  }

  return errors
}

function getAllPartials(partialRoot: string): string[] {
  if (!fs.existsSync(partialRoot)) {
    return []
  }

  const files = walkDir(partialRoot)
  return files
    .filter(file => file.endsWith('.hbs'))
    .map(file => {
      const relative = path.relative(partialRoot, file)
      return relative.replace(/\.hbs$/, '').replace(/\\/g, '/')
    })
}
