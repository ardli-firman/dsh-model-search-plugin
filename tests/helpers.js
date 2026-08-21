/**
 * Test helper: extract the ModelSearch component and apply function
 * from the DSH module loader wrapper in client.js.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import React from 'react'

const CLIENT_PATH = resolve(import.meta.dirname, '..', 'lib', 'client.js')

/**
 * Load the client plugin and return { ModelSearch, apply, inject }.
 * Uses eval to execute client.js in the current jsdom context so
 * window.__ModuleLoader__ is visible.
 */
export function loadClientPlugin() {
  // Set up the mock module loader on the jsdom window
  let capturedSpec = null
  window.__ModuleLoader__ = {
    load(spec) {
      capturedSpec = spec
    },
  }

  // Read and execute client.js in the current context
  const code = readFileSync(CLIENT_PATH, 'utf-8')
  // eslint-disable-next-line no-eval
  ;(0, eval)(code)

  if (!capturedSpec) {
    throw new Error('client.js did not call __ModuleLoader__.load()')
  }

  // Run the factory with a mock require
  const mockRequire = (mod) => {
    if (mod === 'react') return React
    throw new Error(`Unknown module: ${mod}`)
  }

  const exports = capturedSpec.factory(mockRequire)
  return {
    ModelSearch: exports.default || exports.ModelSearch,
    apply: exports.apply,
    inject: exports.inject,
  }
}

/**
 * Create a mock directory store (mimics the real per-session store
 * from the plugin's apply function).
 */
export function createMockDirectory(initialState = {}) {
  const state = {
    current: initialState.current || null,
    groups: initialState.groups || [],
    status: initialState.status || 'idle',
    error: initialState.error || null,
  }
  const subscribers = new Set()
  let snapshot = { ...state }

  return {
    subscribe(fn) {
      subscribers.add(fn)
      return () => subscribers.delete(fn)
    },
    getSnapshot() {
      return snapshot
    },
    setState(updates) {
      Object.assign(state, updates)
      snapshot = { ...state }
      subscribers.forEach(fn => fn())
    },
    getState() {
      return state
    },
  }
}

/**
 * Create mock props for the ModelSearch component.
 */
export function createMockProps(overrides = {}) {
  const directory = overrides.directory || createMockDirectory()
  return {
    locked: false,
    available: true,
    directory,
    load: overrides.load || (() => {}),
    select: overrides.select || (() => Promise.resolve(true)),
    ...overrides,
  }
}

/**
 * Sample model groups for testing.
 */
export const SAMPLE_GROUPS = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3' },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1' },
    ],
  },
]
