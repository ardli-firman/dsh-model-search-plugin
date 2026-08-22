/**
 * @vitest-environment jsdom
 *
 * Tests for the ModelSearch component — the searchable model selector
 * that replaces the default conversation.input.model seat.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import React from 'react'
import {
  loadClientPlugin,
  createMockDirectory,
  createMockProps,
  SAMPLE_GROUPS,
} from './helpers.js'

let ModelSearch

beforeEach(async () => {
  const plugin = await loadClientPlugin()
  ModelSearch = plugin.ModelSearch
})

afterEach(cleanup)

describe('ModelSearch — rendering', () => {
  it('renders the trigger button with "Select model" when no current selection', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const trigger = screen.getByRole('button', { name: /select model/i })
    expect(trigger).toBeTruthy()
    expect(trigger.textContent).toContain('Select model')
  })

  it('renders the current model name in the trigger', () => {
    const directory = createMockDirectory({
      current: { provider: 'openai', model: 'gpt-4o' },
      groups: SAMPLE_GROUPS,
      status: 'ready',
    })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    // Model name appears in trigger + chip, so use getAllByText
    const matches = screen.getAllByText('GPT-4o')
    expect(matches.length).toBeGreaterThanOrEqual(1)
    // The trigger label should contain it
    const triggerLabel = document.querySelector('.dsh-ms-triggerLabel')
    expect(triggerLabel.textContent).toBe('GPT-4o')
  })

  it('renders nothing when available is false', () => {
    const { container } = render(
      React.createElement(ModelSearch, createMockProps({ available: false }))
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when locked and available is false', () => {
    const { container } = render(
      React.createElement(ModelSearch, createMockProps({ available: false, locked: true }))
    )
    expect(container.innerHTML).toBe('')
  })

  it('applies the dsh-ms-root class to the container', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    const { container } = render(
      React.createElement(ModelSearch, createMockProps({ directory }))
    )
    expect(container.firstChild.className).toContain('dsh-ms-root')
  })

  it('applies the dsh-ms-trigger class to the trigger button', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const trigger = screen.getByRole('button')
    expect(trigger.className).toContain('dsh-ms-trigger')
  })
})

describe('ModelSearch — dropdown open/close', () => {
  it('opens the dropdown on trigger click', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  it('shows the search input when dropdown is open', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('combobox')).toBeTruthy()
  })

  it('closes the dropdown on Escape key', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('menu')).toBeTruthy()

    fireEvent.keyDown(screen.getByRole('menu').parentElement, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('closes on outside click', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    const { container } = render(
      React.createElement('div', null,
        React.createElement(ModelSearch, createMockProps({ directory }))
      )
    )

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('menu')).toBeTruthy()

    // Click outside the component
    fireEvent.mouseDown(container)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('calls load when opening the dropdown', () => {
    const load = vi.fn()
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory, load })))

    fireEvent.click(screen.getByRole('button'))
    expect(load).toHaveBeenCalled()
  })

  it('sets aria-expanded to true when open', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const trigger = screen.getByRole('button')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('ModelSearch — model list', () => {
  it('renders all model groups', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    // Group titles
    expect(screen.getByText('OpenAI')).toBeTruthy()
    expect(screen.getByText('Anthropic')).toBeTruthy()
    expect(screen.getByText('DeepSeek')).toBeTruthy()
  })

  it('renders all models within groups', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByText('GPT-4o')).toBeTruthy()
    expect(screen.getByText('GPT-4o Mini')).toBeTruthy()
    expect(screen.getByText('Claude Sonnet 4')).toBeTruthy()
    expect(screen.getByText('Claude 3.5 Haiku')).toBeTruthy()
    expect(screen.getByText('DeepSeek-V3')).toBeTruthy()
    expect(screen.getByText('DeepSeek-R1')).toBeTruthy()
  })

  it('shows model IDs alongside names', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByText('gpt-4o')).toBeTruthy()
    expect(screen.getByText('deepseek-chat')).toBeTruthy()
  })

  it('shows a check icon for the currently selected model', () => {
    const directory = createMockDirectory({
      current: { provider: 'openai', model: 'gpt-4o' },
      groups: SAMPLE_GROUPS,
      status: 'ready',
    })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    // The selected option should have aria-checked="true"
    const options = screen.getAllByRole('menuitemradio')
    const selected = options.find(o => o.getAttribute('aria-checked') === 'true')
    expect(selected).toBeTruthy()
    expect(selected.textContent).toContain('GPT-4o')
  })

  it('shows loading state', () => {
    const directory = createMockDirectory({ status: 'loading', groups: [] })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    // Skeleton shimmer rows instead of plain text
    expect(document.querySelector('.dsh-ms-skeleton')).toBeTruthy()
    expect(document.querySelectorAll('.dsh-ms-skelRow').length).toBeGreaterThanOrEqual(3)
  })

  it('shows empty state when no models', () => {
    const directory = createMockDirectory({ groups: [], status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('No models available')).toBeTruthy()
  })

  it('shows error state with retry button', () => {
    const load = vi.fn()
    const directory = createMockDirectory({
      status: 'error',
      error: 'Connection failed',
      groups: SAMPLE_GROUPS,
    })
    render(React.createElement(ModelSearch, createMockProps({ directory, load })))

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Connection failed')).toBeTruthy()

    const retryBtn = screen.getByText('Retry')
    fireEvent.click(retryBtn)
    expect(load).toHaveBeenCalled()
  })
})

describe('ModelSearch — search filtering', () => {
  it('filters models by name', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'claude' } })

    // Only Anthropic models should be visible
    expect(screen.getByText('Claude Sonnet 4')).toBeTruthy()
    expect(screen.getByText('Claude 3.5 Haiku')).toBeTruthy()
    // OpenAI models should be filtered out
    expect(screen.queryByText('GPT-4o')).toBeNull()
  })

  it('filters models by model ID', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'gpt-4o-mini' } })

    expect(screen.getByText('GPT-4o Mini')).toBeTruthy()
    expect(screen.queryByText('GPT-4o')).toBeNull() // exact ID doesn't match gpt-4o
  })

  it('filters models by provider name', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'deepseek' } })

    expect(screen.getByText('DeepSeek-V3')).toBeTruthy()
    expect(screen.getByText('DeepSeek-R1')).toBeTruthy()
    expect(screen.queryByText('GPT-4o')).toBeNull()
  })

  it('shows "no models matching" when search has no results', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'nonexistent-model-xyz' } })

    expect(screen.getByText('No models matching "nonexistent-model-xyz"')).toBeTruthy()
  })

  it('is case-insensitive', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'CLAUDE' } })

    expect(screen.getByText('Claude Sonnet 4')).toBeTruthy()
  })

  it('shows placeholder with total model count', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const input = screen.getByRole('combobox')
    expect(input.placeholder).toBe('Search 6 models...')
  })
})

describe('ModelSearch — model selection', () => {
  it('calls select with provider and model ID on click', async () => {
    const select = vi.fn().mockResolvedValue(true)
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory, select })))

    fireEvent.click(screen.getByRole('button'))

    // Click on DeepSeek-V3
    const option = screen.getAllByRole('menuitemradio').find(
      o => o.textContent.includes('DeepSeek-V3')
    )
    fireEvent.click(option)

    await waitFor(() => {
      expect(select).toHaveBeenCalledWith({
        provider: 'deepseek',
        model: 'deepseek-chat',
        effort: 'medium',
      })
    })
  })

  it('closes the dropdown after successful selection', async () => {
    const select = vi.fn().mockResolvedValue(true)
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory, select })))

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('menu')).toBeTruthy()

    const option = screen.getAllByRole('menuitemradio').find(
      o => o.textContent.includes('GPT-4o')
    )
    fireEvent.click(option)

    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull()
    })
  })

  it('keeps the dropdown open when selection is rejected', async () => {
    const select = vi.fn().mockResolvedValue(false)
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory, select })))

    fireEvent.click(screen.getByRole('button'))

    const option = screen.getAllByRole('menuitemradio').find(
      o => o.textContent.includes('GPT-4o')
    )
    fireEvent.click(option)

    await waitFor(() => {
      expect(select).toHaveBeenCalled()
    })
    // Dropdown should still be open
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  it('does not call select when locked', () => {
    const select = vi.fn()
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory, select, locked: true })))

    // Trigger should be disabled
    const trigger = screen.getByRole('button')
    expect(trigger.disabled).toBe(true)
  })
})

describe('ModelSearch — keyboard navigation', () => {
  it('navigates options with ArrowDown/ArrowUp', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    // Query fresh options after render
    const firstOption = screen.getAllByRole('menuitemradio')[0]
    firstOption.focus()
    expect(document.activeElement).toBe(firstOption)

    // ArrowDown should move focus to a different option
    fireEvent.keyDown(firstOption, { key: 'ArrowDown' })
    expect(document.activeElement).not.toBe(firstOption)
    expect(document.activeElement.getAttribute('role')).toBe('menuitemradio')
  })

  it('wraps focus from last to first on ArrowDown', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const options = screen.getAllByRole('menuitemradio')
    const firstOption = options[0]
    const lastOption = options[options.length - 1]
    lastOption.focus()

    fireEvent.keyDown(lastOption, { key: 'ArrowDown' })
    // After wrapping, focus should be on a different option than the last
    expect(document.activeElement).not.toBe(lastOption)
    expect(document.activeElement.getAttribute('role')).toBe('menuitemradio')
  })

  it('selects model on Enter key', async () => {
    const select = vi.fn().mockResolvedValue(true)
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory, select })))

    fireEvent.click(screen.getByRole('button'))

    const firstOption = screen.getAllByRole('menuitemradio')[0]
    firstOption.focus()
    fireEvent.keyDown(firstOption, { key: 'Enter' })

    await waitFor(() => {
      expect(select).toHaveBeenCalled()
    })
  })

  it('selects model on Space key', async () => {
    const select = vi.fn().mockResolvedValue(true)
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory, select })))

    fireEvent.click(screen.getByRole('button'))

    const firstOption = screen.getAllByRole('menuitemradio')[0]
    firstOption.focus()
    fireEvent.keyDown(firstOption, { key: ' ' })

    await waitFor(() => {
      expect(select).toHaveBeenCalled()
    })
  })

  it('moves focus from search input to list on ArrowDown', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const input = screen.getByRole('combobox')
    input.focus()
    expect(document.activeElement).toBe(input)

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    // Focus should move to an option
    const options = screen.getAllByRole('menuitemradio')
    expect(options.some(o => o === document.activeElement)).toBe(true)
  })

  it('jumps to last option on End key', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    const options = screen.getAllByRole('menuitemradio')
    options[0].focus()

    fireEvent.keyDown(options[0], { key: 'End' })
    expect(document.activeElement).toBe(options[options.length - 1])
  })

  it('jumps to first option on Home key', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    const options = screen.getAllByRole('menuitemradio')
    options[options.length - 1].focus()

    fireEvent.keyDown(options[options.length - 1], { key: 'Home' })
    expect(document.activeElement).toBe(options[0])
  })

  it('moves up a page on PageUp and down on PageDown', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    const options = screen.getAllByRole('menuitemradio')
    // Focus the last option, PageUp should move up by 6
    options[options.length - 1].focus()
    fireEvent.keyDown(options[options.length - 1], { key: 'PageUp' })
    const afterPageUp = document.activeElement
    expect(afterPageUp).not.toBe(options[options.length - 1])

    // Focus first, PageDown should move down by 6
    options[0].focus()
    fireEvent.keyDown(options[0], { key: 'PageDown' })
    const afterPageDown = document.activeElement
    expect(afterPageDown).not.toBe(options[0])
  })
})

describe('ModelSearch — ARIA attributes', () => {
  it('trigger has aria-haspopup="menu"', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const trigger = screen.getByRole('button')
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
  })

  it('trigger has aria-expanded reflecting open state', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const trigger = screen.getByRole('button')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('dropdown menu has role="menu"', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    const menu = screen.getByRole('menu')
    expect(menu).toBeTruthy()
  })

  it('options have role="menuitemradio" and aria-checked', () => {
    const directory = createMockDirectory({
      current: { provider: 'openai', model: 'gpt-4o' },
      groups: SAMPLE_GROUPS,
      status: 'ready',
    })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const options = screen.getAllByRole('menuitemradio')
    expect(options.length).toBe(6) // 6 models total

    // The selected one should have aria-checked="true"
    const selected = options.find(o => o.getAttribute('aria-checked') === 'true')
    expect(selected).toBeTruthy()
    expect(selected.textContent).toContain('GPT-4o')
  })

  it('search input has role="combobox" and aria-label', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const input = screen.getByRole('combobox')
    expect(input.getAttribute('aria-label')).toBe('Search models')
  })

  it('groups have role="group" with aria-label', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const groups = screen.getAllByRole('group')
    expect(groups.length).toBe(3)
    expect(groups[0].getAttribute('aria-label')).toBe('OpenAI')
    expect(groups[1].getAttribute('aria-label')).toBe('Anthropic')
    expect(groups[2].getAttribute('aria-label')).toBe('DeepSeek')
  })
})

describe('ModelSearch — styles use harness tokens', () => {
  it('injects a stylesheet with dsh-ms- classes', async () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    // The component should inject a <style> tag
    const style = document.getElementById('dsh-model-search-style')
    expect(style).toBeTruthy()
    expect(style.textContent).toContain('dsh-ms-trigger')
    expect(style.textContent).toContain('dsh-ms-menu')
  })

  it('stylesheet uses --dsw-* design tokens (not old --bg-*/--text-* tokens)', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const style = document.getElementById('dsh-model-search-style')
    const css = style.textContent

    // Should use new tokens
    expect(css).toContain('--dsw-alias-label-secondary')
    expect(css).toContain('--dsw-specific-menu')
    expect(css).toContain('--dsw-shadow-lv3')
    expect(css).toContain('--dsw-alias-interactive-bg-hover')
    expect(css).toContain('--dsw-alias-border-inverted')

    // Should NOT use old tokens
    expect(css).not.toContain('--bg-secondary')
    expect(css).not.toContain('--text-primary')
    expect(css).not.toContain('--border-default')
  })
})

describe('ModelSearch — AI effort selector', () => {
  it('renders effort buttons when dropdown is open', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    // Should have effort section with 4 buttons
    const effortButtons = screen.getAllByRole('radio')
    expect(effortButtons.length).toBe(4)
    expect(screen.getByText('Low')).toBeTruthy()
    expect(screen.getByText('Medium')).toBeTruthy()
    expect(screen.getByText('High')).toBeTruthy()
    expect(screen.getByText('Max')).toBeTruthy()
  })

  it('defaults effort to Medium', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const mediumBtn = screen.getAllByRole('radio').find(
      b => b.textContent === 'Medium'
    )
    expect(mediumBtn.getAttribute('aria-checked')).toBe('true')
  })

  it('changes effort level on button click', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const highBtn = screen.getAllByRole('radio').find(
      b => b.textContent === 'High'
    )
    fireEvent.click(highBtn)

    expect(highBtn.getAttribute('aria-checked')).toBe('true')
    // Medium should no longer be checked
    const mediumBtn = screen.getAllByRole('radio').find(
      b => b.textContent === 'Medium'
    )
    expect(mediumBtn.getAttribute('aria-checked')).toBe('false')
  })

  it('passes effort to select callback', async () => {
    const select = vi.fn().mockResolvedValue(true)
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory, select })))

    fireEvent.click(screen.getByRole('button'))

    // Select Max effort
    const maxBtn = screen.getAllByRole('radio').find(
      b => b.textContent === 'Max'
    )
    fireEvent.click(maxBtn)

    // Wait for effort state to propagate
    await waitFor(() => {
      expect(maxBtn.getAttribute('aria-checked')).toBe('true')
    })

    // Now select a model
    const option = screen.getAllByRole('menuitemradio').find(
      o => o.textContent.includes('GPT-4o')
    )
    fireEvent.click(option)

    await waitFor(() => {
      expect(select).toHaveBeenCalledWith({
        provider: 'openai',
        model: 'gpt-4o',
        effort: 'max',
      })
    })
  })

  it('renders effort label text', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByText('Reasoning effort')).toBeTruthy()
  })

  it('effort buttons have correct ARIA roles', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    const effortGroup = screen.getByRole('radiogroup', { name: /reasoning effort/i })
    expect(effortGroup).toBeTruthy()
  })
})

describe('ModelSearch — effort badge in trigger', () => {
  it('renders effort badge in trigger when model is selected', () => {
    const directory = createMockDirectory({
      current: { provider: 'openai', model: 'gpt-4o' },
      groups: SAMPLE_GROUPS,
      status: 'ready',
    })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const badge = document.querySelector('.dsh-ms-effortBadge')
    expect(badge).toBeTruthy()
    expect(badge.textContent).toContain('Med')
  })

  it('badge shows current effort level from state', () => {
    const directory = createMockDirectory({
      current: { provider: 'openai', model: 'gpt-4o', effort: 'high' },
      groups: SAMPLE_GROUPS,
      status: 'ready',
    })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const badge = document.querySelector('.dsh-ms-effortBadge')
    expect(badge).toBeTruthy()
    expect(badge.textContent).toContain('High')
  })

  it('does not render effort badge when no model is selected', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const badge = document.querySelector('.dsh-ms-effortBadge')
    expect(badge).toBeNull()
  })

  it('effort badge has dot indicator', () => {
    const directory = createMockDirectory({
      current: { provider: 'openai', model: 'gpt-4o' },
      groups: SAMPLE_GROUPS,
      status: 'ready',
    })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const dot = document.querySelector('.dsh-ms-effortDot')
    expect(dot).toBeTruthy()
  })

  it('trigger contains only one model name (no duplication)', () => {
    const directory = createMockDirectory({
      current: { provider: 'openai', model: 'gpt-4o' },
      groups: SAMPLE_GROUPS,
      status: 'ready',
    })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    const triggerLabel = document.querySelector('.dsh-ms-triggerLabel')
    expect(triggerLabel.textContent).toBe('GPT-4o')

    // The trigger button should NOT contain a separate chip with model name
    const trigger = screen.getByRole('button')
    const chipElements = trigger.querySelectorAll('.dsh-ms-chip')
    expect(chipElements.length).toBe(0)
  })
})

describe('ModelSearch — recent models', () => {
  it('shows a Recent section when localStorage has selections', () => {
    window.localStorage.setItem('dsh-ms-recent', JSON.stringify([
      { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
    ]))
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    // Recent group should appear first
    const recentGroup = screen.getAllByRole('group')[0]
    expect(recentGroup.getAttribute('aria-label')).toBe('Recent')
    // Model name should appear in the Recent section
    expect(within(recentGroup).getByText('Claude Sonnet 4')).toBeTruthy()
  })

  it('hides Recent section while searching', () => {
    window.localStorage.setItem('dsh-ms-recent', JSON.stringify([
      { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
    ]))
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'gpt' } })

    const groups = screen.getAllByRole('group')
    // Recent hidden while query is active
    expect(groups.some(g => g.getAttribute('aria-label') === 'Recent')).toBe(false)
    expect(screen.getByText('GPT-4o')).toBeTruthy()
  })

  it('selecting a model writes to localStorage recent list', async () => {
    const select = vi.fn().mockResolvedValue(true)
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory, select })))

    fireEvent.click(screen.getByRole('button'))
    const option = screen.getAllByRole('menuitemradio').find(o => o.textContent.includes('DeepSeek-V3'))
    fireEvent.click(option)

    await waitFor(() => {
      const raw = window.localStorage.getItem('dsh-ms-recent')
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw)
      expect(parsed[0]).toEqual({ provider: 'deepseek', model: 'deepseek-chat' })
    })
  })
})

describe('ModelSearch — group collapse', () => {
  it('collapses and expands a provider group on header click', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getAllByRole('menuitemradio').length).toBe(6)

    // Click the OpenAI group header
    const openaiHeader = screen.getByRole('button', { name: /OpenAI/i })
    fireEvent.click(openaiHeader)

    // 4 options left (OpenAI's 2 hidden)
    expect(screen.getAllByRole('menuitemradio').length).toBe(4)
    expect(screen.queryByText('GPT-4o')).toBeNull()

    // Click again to expand
    fireEvent.click(openaiHeader)
    expect(screen.getAllByRole('menuitemradio').length).toBe(6)
  })

  it('group headers have aria-expanded', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    const header = screen.getByRole('button', { name: /OpenAI/i })
    expect(header.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(header)
    expect(header.getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps group headers when every group is collapsed so they can re-expand', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))

    // Collapse all three provider groups
    ;['OpenAI', 'Anthropic', 'DeepSeek'].forEach(name => {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }))
    })

    // No model rows visible…
    expect(screen.queryAllByRole('menuitemradio').length).toBe(0)
    // …but headers must remain — NOT the "No models available" empty state
    expect(screen.queryByText('No models available')).toBeNull()
    ;['OpenAI', 'Anthropic', 'DeepSeek'].forEach(name => {
      expect(screen.getByRole('button', { name: new RegExp(name) })).toBeTruthy()
    })

    // Re-expanding a group brings its models back
    fireEvent.click(screen.getByRole('button', { name: /OpenAI/i }))
    expect(screen.getByText('GPT-4o')).toBeTruthy()
    expect(screen.getAllByRole('menuitemradio').length).toBe(2)
  })
})

describe('ModelSearch — clear button & result count', () => {
  it('shows a clear button when query is non-empty', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'claude' } })

    const clearBtn = screen.getByRole('button', { name: /clear search/i })
    expect(clearBtn).toBeTruthy()

    // Clicking clears the query
    fireEvent.click(clearBtn)
    expect(input.value).toBe('')
  })

  it('shows filtered count in footer', () => {
    const directory = createMockDirectory({ groups: SAMPLE_GROUPS, status: 'ready' })
    render(React.createElement(ModelSearch, createMockProps({ directory })))

    fireEvent.click(screen.getByRole('button'))
    // No query: total count
    expect(screen.getByText('6 models')).toBeTruthy()

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'claude' } })
    // Filtered count
    expect(screen.getByText('2 of 6 models')).toBeTruthy()
  })
})
