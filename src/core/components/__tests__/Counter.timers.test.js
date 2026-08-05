import React from 'react'
import {act, render} from '@testing-library/react'
import '@testing-library/jest-dom'
import Counter from '../Counter'

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

describe('Counter lifecycle contracts', () => {
  beforeEach(() => jest.useFakeTimers())

  afterEach(() => {
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
    const counter = React.createRef()
    const view = renderCounter({start: 3, end: 3, ref: counter})

    act(() => counter.current.animate())

    expect(view.container).toHaveTextContent('3')
    expect(counter.current.timers).toEqual([])
  })

  it('cancels pending animation when props become a static value', () => {
    const counter = React.createRef()
    const view = renderCounter({delay: 100, ref: counter})

    view.rerender(
      <Counter
        ref={counter}
        start={7}
        end={7}
        delay={0}
        duration={100}
        interval={25}
        easingFn={linear}
        render={renderValue}
      />
    )

    expect(view.container).toHaveTextContent('7')
    expect(counter.current.timers).toEqual([])
  })

  it('completes immediately when duration is zero', () => {
    const counter = React.createRef()
    const view = renderCounter({duration: 0, ref: counter})

    expect(view.container).toHaveTextContent('10')
    expect(counter.current.timers).toEqual([])
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
    const counter = React.createRef()
    const view = renderCounter({delay: 100, ref: counter})
    const instance = counter.current

    expect(instance.timers).toHaveLength(1)
    view.unmount()

    expect(instance.timers).toEqual([])
  })
})
