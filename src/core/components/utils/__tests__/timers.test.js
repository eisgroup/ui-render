/**
 * `useTimers`: the timers a function component owns, cleared when it unmounts (§9.3 step 6). It
 * replaced `@withTimer` component by component, until the decorator went with its last class, so
 * what the decorator guaranteed a class is what these pin for the hook: timeouts run at their delay
 * with their arguments, `clear()` cancels all of them, and unmounting cancels whatever is still
 * pending.
 */
import React from 'react'
import { act, render } from '@testing-library/react'
import { useTimers } from '../timers'

/** Renders a component that records the timers object `useTimers` returns on every render. */
const mountHarness = () => {
  const seen = []
  const Harness = () => {
    seen.push(useTimers())
    return <div data-testid='timers-harness'/>
  }
  const view = render(<Harness/>)
  return {...view, timers: () => seen[seen.length - 1], seen, Harness}
}

describe('useTimers', () => {
  beforeEach(() => jest.useFakeTimers())

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('runs timeouts at their delays and forwards callback arguments', () => {
    const first = jest.fn()
    const second = jest.fn()
    const view = mountHarness()

    view.timers().setTimeout(first, 30, 'first', 1)
    view.timers().setTimeout(second, 10, {id: 2})

    act(() => jest.advanceTimersByTime(10))
    expect(second).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledWith({id: 2})
    expect(first).not.toHaveBeenCalled()

    act(() => jest.advanceTimersByTime(20))
    expect(first).toHaveBeenCalledTimes(1)
    expect(first).toHaveBeenCalledWith('first', 1)
  })

  it('cancels every pending timer on clear()', () => {
    const first = jest.fn()
    const second = jest.fn()
    const view = mountHarness()

    view.timers().setTimeout(first, 10)
    view.timers().setTimeout(second, 20)
    view.timers().clear()
    act(() => jest.advanceTimersByTime(50))

    expect(first).not.toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
  })

  it('cancels what is still pending when the component unmounts, and only that', () => {
    const fired = jest.fn()
    const pending = jest.fn()
    const cleared = jest.spyOn(global, 'clearTimeout')
    try {
      const view = mountHarness()

      const firedId = view.timers().setTimeout(fired, 10)
      const pendingId = view.timers().setTimeout(pending, 50)
      act(() => jest.advanceTimersByTime(10))
      expect(fired).toHaveBeenCalledTimes(1)

      view.unmount()
      act(() => jest.advanceTimersByTime(50))

      expect(pending).not.toHaveBeenCalled()
      // The timer that already fired is no longer tracked, so unmounting clears the pending one only.
      expect(cleared).toHaveBeenCalledWith(pendingId)
      expect(cleared).not.toHaveBeenCalledWith(firedId)
    } finally {
      // Before the fake timers are uninstalled: a spy left on them breaks the next test's timers.
      cleared.mockRestore()
    }
  })

  it('returns the same object on every render', () => {
    const view = mountHarness()

    view.rerender(<view.Harness/>)

    expect(view.seen).toHaveLength(2)
    expect(view.seen[1]).toBe(view.seen[0])
  })
})
