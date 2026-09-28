import React from 'react'
import {act, render} from '@testing-library/react'
import '@testing-library/jest-dom'
import Counter, {nextFrame} from '../Counter'

const renderValue = (value) => String(value)
const renderValueWithDecimals = (value, decimals) => `${value}:${decimals}`
const linear = (value) => value

const renderCounter = (props) => render(
  <Counter
    start={0}
    end={10}
    delay={0}
    duration={100}
    interval={25}
    easingFn={linear}
    render={renderValue}
    {...props}
  />
)

/**
 * The timers the counter scheduled with a given delay, and which were cleared, read through spies.
 * These tests used to read `ref.current.timers`, the array `@withTimer` kept on the class instance;
 * the component is a function since §9.3 step 6, so there is no instance and no array. Not
 * `jest.getTimerCount()` either: on React 16 and 17 it also counts the scheduler's own timer.
 */
const watchTimers = () => {
  const scheduled = jest.spyOn(global, 'setTimeout')
  const cleared = jest.spyOn(global, 'clearTimeout')
  return {
    scheduledWith: delay => scheduled.mock.calls
      .map((call, i) => (call[1] === delay ? [scheduled.mock.results[i].value] : []))
      .flat(),
    wasCleared: id => cleared.mock.calls.some(([clearedId]) => clearedId === id),
    restore: () => {
      scheduled.mockRestore()
      cleared.mockRestore()
    },
  }
}

describe('Counter lifecycle contracts', () => {
  let timers

  beforeEach(() => {
    jest.useFakeTimers()
    timers = watchTimers()
  })

  afterEach(() => {
    // The spies wrap the fake timers, so they come off before the real timers go back.
    timers.restore()
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('waits for the delay, animates ascending values and finishes exactly at end', () => {
    const view = renderCounter({end: 8, delay: 40, duration: 80, interval: 20})

    act(() => jest.advanceTimersByTime(39))
    expect(view.container).toHaveTextContent('0')

    act(() => jest.advanceTimersByTime(1))
    expect(view.container).toHaveTextContent('0')

    act(() => jest.advanceTimersByTime(20))
    expect(view.container).toHaveTextContent('2')

    act(() => jest.advanceTimersByTime(60))
    expect(view.container).toHaveTextContent('8')
  })

  it('animates descending values and finishes exactly at end', () => {
    const view = renderCounter({start: 10, end: -10})

    act(() => jest.runAllTimers())

    expect(view.container).toHaveTextContent('-10')
  })

  it('does not lose frames when easing schedules every update together', () => {
    const view = renderCounter({easingFn: () => 0})

    act(() => jest.runAllTimers())

    expect(view.container).toHaveTextContent('10')
  })

  it('restarts from a changed start even when end stays the same', () => {
    const view = renderCounter({delay: 100})

    view.rerender(
      <Counter
        start={40}
        end={10}
        delay={100}
        duration={100}
        interval={25}
        easingFn={linear}
        render={renderValue}
      />
    )

    expect(view.container).toHaveTextContent('40')

    act(() => jest.runAllTimers())
    expect(view.container).toHaveTextContent('10')
  })

  it.each([
    ['duration', {duration: 50}],
    ['delay', {delay: 50}],
    ['interval', {interval: 10}],
    ['easing', {easingFn: () => 0}],
  ])('restarts when %s changes while end stays the same', (_name, changedProps) => {
    const view = renderCounter()

    act(() => jest.advanceTimersByTime(25))
    expect(view.container).toHaveTextContent('2.5')

    view.rerender(
      <Counter
        start={0}
        end={10}
        delay={0}
        duration={100}
        interval={25}
        easingFn={linear}
        render={renderValue}
        {...changedProps}
      />
    )

    expect(view.container).toHaveTextContent('0')

    act(() => jest.runAllTimers())

    expect(view.container).toHaveTextContent('10')
  })

  it('does not restart when only display props change', () => {
    const view = renderCounter({decimals: 0, render: renderValueWithDecimals})

    act(() => jest.advanceTimersByTime(25))
    expect(view.container).toHaveTextContent('2.5:0')

    view.rerender(
      <Counter
        start={0}
        end={10}
        delay={0}
        duration={100}
        interval={25}
        easingFn={linear}
        decimals={2}
        render={renderValueWithDecimals}
      />
    )

    expect(view.container).toHaveTextContent('2.5:2')

    act(() => jest.runAllTimers())
    expect(view.container).toHaveTextContent('10:2')
  })

  it('cancels stale work before restarting with a new target', () => {
    const view = renderCounter({end: 100, delay: 100})

    view.rerender(
      <Counter
        start={10}
        end={20}
        delay={0}
        duration={20}
        interval={10}
        easingFn={linear}
        render={renderValue}
      />
    )

    act(() => jest.runAllTimers())

    expect(view.container).toHaveTextContent('20')
  })

  it('ignores a late frame after an animation has already completed', () => {
    // The frame step is a pure function since §9.3 step 6; this used to call the class's `animate`
    // through a ref. With no steps left it keeps the state object, so React skips the update.
    const done = {value: 3, steps: 0}

    expect(nextFrame(done, 3)).toBe(done)
    expect(nextFrame({value: 0, steps: 4}, 10)).toEqual({value: 2.5, steps: 3})
    expect(nextFrame({value: 7.5, steps: 1}, 10)).toEqual({value: 10, steps: 0})
  })

  it('cancels pending animation when props become a static value', () => {
    const view = renderCounter({delay: 100})
    const [pending] = timers.scheduledWith(100)

    view.rerender(
      <Counter
        start={7}
        end={7}
        delay={60}
        duration={100}
        interval={25}
        easingFn={linear}
        render={renderValue}
      />
    )

    expect(view.container).toHaveTextContent('7')
    expect(timers.wasCleared(pending)).toBe(true)
    expect(timers.scheduledWith(60)).toEqual([])
  })

  it('completes immediately when duration is zero', () => {
    const view = renderCounter({duration: 0, delay: 40})

    expect(view.container).toHaveTextContent('10')
    expect(timers.scheduledWith(40)).toEqual([])
  })

  it.each([
    ['negative duration', {duration: -1}],
    ['NaN duration', {duration: Number.NaN}],
    ['infinite duration', {duration: Number.POSITIVE_INFINITY}],
    ['zero interval', {interval: 0}],
    ['negative interval', {interval: -1}],
    ['NaN interval', {interval: Number.NaN}],
    ['infinite interval', {interval: Number.POSITIVE_INFINITY}],
    ['negative delay', {delay: -1}],
    ['NaN delay', {delay: Number.NaN}],
    ['infinite delay', {delay: Number.POSITIVE_INFINITY}],
  ])('falls back safely for %s', (_name, timingProps) => {
    const view = renderCounter(timingProps)

    act(() => jest.runAllTimers())

    expect(view.container).toHaveTextContent('10')
  })

  it.each([
    ['non-finite', () => Number.NaN],
    ['negative', () => -1],
  ])('finishes when easing returns a %s delay', (_name, easingFn) => {
    const view = renderCounter({easingFn})

    act(() => jest.runAllTimers())

    expect(view.container).toHaveTextContent('10')
  })

  it('cleans up a delayed animation on unmount', () => {
    const view = renderCounter({delay: 100})
    const [pending] = timers.scheduledWith(100)

    expect(timers.wasCleared(pending)).toBe(false)
    view.unmount()

    expect(timers.wasCleared(pending)).toBe(true)
  })
})
