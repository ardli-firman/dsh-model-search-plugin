/**
 * @vitest-environment jsdom
 *
 * Tests for the plugin's apply() function — the registration logic
 * that wires ModelSearch into the conversation.input.model slot.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadClientPlugin } from './helpers.js'

let apply, inject

beforeEach(async () => {
  const plugin = await loadClientPlugin()
  apply = plugin.apply
  inject = plugin.inject
})

describe('plugin exports', () => {
  it('exports an apply function', () => {
    expect(typeof apply).toBe('function')
  })

  it('exports an inject array with required services', () => {
    expect(Array.isArray(inject)).toBe(true)
    expect(inject).toContain('connection')
    expect(inject).toContain('sessions')
    expect(inject).toContain('slots')
  })
})

describe('plugin apply — slot registration', () => {
  function createMockCtx(overrides = {}) {
    const registered = []
    const injected = []

    return {
      slots: {
        inject(name, callback) {
          injected.push(name)
          return callback()
        },
        register(options, component) {
          registered.push({ options, component })
          return () => {} // disposer
        },
      },
      connection: {
        api: {
          sessions: {
            models: vi.fn().mockResolvedValue({
              result: {
                ok: true,
                value: {
                  current: { provider: 'openai', model: 'gpt-4o' },
                  groups: [{
                    id: 'openai',
                    name: 'OpenAI',
                    models: [{ id: 'gpt-4o', name: 'GPT-4o' }],
                  }],
                },
              },
            }),
            selectModel: vi.fn().mockResolvedValue({
              result: {
                ok: true,
                value: { selected: { provider: 'openai', model: 'gpt-4o' } },
              },
            }),
          },
        },
      },
      sessions: {
        subagentAddress: vi.fn().mockReturnValue(undefined),
      },
      ...overrides,
      _registered: registered,
      _injected: injected,
    }
  }

  it('registers into the conversation.input.model slot', () => {
    const ctx = createMockCtx()
    apply(ctx)

    expect(ctx._injected).toContain('conversation.input.model')
    expect(ctx._registered.length).toBe(1)
    expect(ctx._registered[0].options.name).toBe('conversation.input.model')
  })

  it('returns early if slots is not available', () => {
    const ctx = { slots: null, connection: null, sessions: null }
    // Should not throw
    expect(() => apply(ctx)).not.toThrow()
  })

  it('returns early if connection is not available', () => {
    const ctx = createMockCtx({ connection: null })
    apply(ctx)
    // Should not register anything
    expect(ctx._registered.length).toBe(0)
  })

  it('returns early if connection.api.sessions is not available', () => {
    const ctx = createMockCtx({ connection: { api: {} } })
    apply(ctx)
    expect(ctx._registered.length).toBe(0)
  })

  it('inject function returns directory props for a session', () => {
    const ctx = createMockCtx()
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    expect(typeof injectFn).toBe('function')

    const props = injectFn('session-123')
    expect(props).toHaveProperty('available')
    expect(props).toHaveProperty('directory')
    expect(props).toHaveProperty('load')
    expect(props).toHaveProperty('select')
    expect(typeof props.load).toBe('function')
    expect(typeof props.select).toBe('function')
  })

  it('marks subagent sessions as unavailable', () => {
    const ctx = createMockCtx()
    ctx.sessions.subagentAddress = vi.fn().mockReturnValue({
      parentSessionId: 'parent',
      childSessionId: 'child',
      mode: 'continuable',
    })
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('subagent-session')
    expect(props.available).toBe(false)
  })

  it('marks direct sessions as available', () => {
    const ctx = createMockCtx()
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('direct-session')
    expect(props.available).toBe(true)
  })
})

describe('plugin apply — directory store', () => {
  function createMockCtx() {
    const registered = []
    const injected = []

    return {
      slots: {
        inject(name, callback) {
          injected.push(name)
          return callback()
        },
        register(options, component) {
          registered.push({ options, component })
          return () => {}
        },
      },
      connection: {
        api: {
          sessions: {
            models: vi.fn().mockResolvedValue({
              result: {
                ok: true,
                value: {
                  current: { provider: 'openai', model: 'gpt-4o' },
                  groups: [{
                    id: 'openai',
                    name: 'OpenAI',
                    models: [{ id: 'gpt-4o', name: 'GPT-4o' }],
                  }],
                },
              },
            }),
            selectModel: vi.fn().mockResolvedValue({
              result: {
                ok: true,
                value: { selected: { provider: 'openai', model: 'gpt-4o' } },
              },
            }),
          },
        },
      },
      sessions: {
        subagentAddress: vi.fn().mockReturnValue(undefined),
      },
      _registered: registered,
      _injected: injected,
    }
  }

  it('directory store starts in idle state', () => {
    const ctx = createMockCtx()
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('session-1')

    const snapshot = props.directory.getSnapshot()
    expect(snapshot.status).toBe('idle')
    expect(snapshot.current).toBeNull()
    expect(snapshot.groups).toEqual([])
    expect(snapshot.error).toBeNull()
  })

  it('directory store loads models and updates snapshot', async () => {
    const ctx = createMockCtx()
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('session-1')

    await props.load()

    const snapshot = props.directory.getSnapshot()
    expect(snapshot.status).toBe('ready')
    expect(snapshot.current).toEqual({ provider: 'openai', model: 'gpt-4o' })
    expect(snapshot.groups).toHaveLength(1)
    expect(snapshot.groups[0].id).toBe('openai')
  })

  it('directory store handles load errors', async () => {
    const ctx = createMockCtx()
    ctx.connection.api.sessions.models = vi.fn().mockResolvedValue({
      result: {
        ok: false,
        error: { code: 'NETWORK_ERROR', message: 'Connection failed' },
      },
    })
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('session-1')

    await props.load()

    const snapshot = props.directory.getSnapshot()
    expect(snapshot.status).toBe('error')
    expect(snapshot.error).toContain('Connection failed')
  })

  it('directory store handles load exceptions', async () => {
    const ctx = createMockCtx()
    ctx.connection.api.sessions.models = vi.fn().mockRejectedValue(new Error('Timeout'))
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('session-1')

    await props.load()

    const snapshot = props.directory.getSnapshot()
    expect(snapshot.status).toBe('error')
    expect(snapshot.error).toBe('Timeout')
  })

  it('select updates the current model on success', async () => {
    const ctx = createMockCtx()
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('session-1')

    // Load first
    await props.load()

    // Select a different model
    ctx.connection.api.sessions.selectModel = vi.fn().mockResolvedValue({
      result: {
        ok: true,
        value: { selected: { provider: 'openai', model: 'gpt-4o-mini' } },
      },
    })

    const accepted = await props.select({ provider: 'openai', model: 'gpt-4o-mini' })
    expect(accepted).toBe(true)

    const snapshot = props.directory.getSnapshot()
    expect(snapshot.current).toEqual({ provider: 'openai', model: 'gpt-4o-mini' })
  })

  it('select returns false on rejection', async () => {
    const ctx = createMockCtx()
    ctx.connection.api.sessions.selectModel = vi.fn().mockResolvedValue({
      result: {
        ok: false,
        error: { code: 'MODEL_UNAVAILABLE', message: 'Model not available' },
      },
    })
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('session-1')

    const accepted = await props.select({ provider: 'openai', model: 'gpt-4o' })
    expect(accepted).toBe(false)

    const snapshot = props.directory.getSnapshot()
    expect(snapshot.error).toContain('Model not available')
  })

  it('select returns false on exception', async () => {
    const ctx = createMockCtx()
    ctx.connection.api.sessions.selectModel = vi.fn().mockRejectedValue(new Error('Network error'))
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('session-1')

    const accepted = await props.select({ provider: 'openai', model: 'gpt-4o' })
    expect(accepted).toBe(false)
  })

  it('each session gets its own directory store', () => {
    const ctx = createMockCtx()
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props1 = injectFn('session-1')
    const props2 = injectFn('session-2')

    // Different sessions should have different directory instances
    expect(props1.directory).not.toBe(props2.directory)
  })

  it('same session returns the same directory store', () => {
    const ctx = createMockCtx()
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props1 = injectFn('session-1')
    const props2 = injectFn('session-1')

    expect(props1.directory).toBe(props2.directory)
  })

  it('directory store notifies subscribers on state change', async () => {
    const ctx = createMockCtx()
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('session-1')

    const snapshots = []
    const unsubscribe = props.directory.subscribe(() => {
      snapshots.push(props.directory.getSnapshot())
    })

    await props.load()

    expect(snapshots.length).toBeGreaterThan(0)
    expect(snapshots[snapshots.length - 1].status).toBe('ready')

    unsubscribe()
  })

  it('unsubscribe stops notifications', async () => {
    const ctx = createMockCtx()
    apply(ctx)

    const injectFn = ctx._registered[0].options.inject
    const props = injectFn('session-1')

    let count = 0
    const unsubscribe = props.directory.subscribe(() => { count++ })

    await props.load()
    const countAfterLoad = count

    unsubscribe()

    // Trigger another update
    ctx.connection.api.sessions.models = vi.fn().mockResolvedValue({
      result: {
        ok: true,
        value: {
          current: { provider: 'openai', model: 'gpt-4o' },
          groups: [{ id: 'openai', name: 'OpenAI', models: [{ id: 'gpt-4o', name: 'GPT-4o' }] }],
        },
      },
    })
    await props.load()

    // Count should not have increased after unsubscribe
    expect(count).toBe(countAfterLoad)
  })
})
