/**
 * Test setup: ensure jsdom globals are available and localStorage is
 * clean between tests (the Recent section persists via localStorage, so
 * a dirty store would leak models into unrelated tests).
 */
import { afterEach } from 'vitest'

afterEach(() => {
  try {
    window.localStorage.clear()
  } catch {
    // non-DOM env
  }
})
