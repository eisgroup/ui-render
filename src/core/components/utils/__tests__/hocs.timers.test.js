import React, {Component} from 'react'
import {act, render} from '@testing-library/react'
import {withTimer} from '../hocs'

class TimerHarness extends Component {
  render () {
    return <div data-testid='timer-harness'/>
  }
}

const TimedHarness = withTimer(TimerHarness)

const mountHarness = () => {
  const ref = React.createRef()
  const view = render(<TimedHarness ref={ref}/>)
  return {...view, instance: ref.current}
}

describe('withTimer contract', () => {
  beforeEach(() => jest.useFakeTimers())

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('runs multiple timeouts at their delays and forwards callback arguments', () => {
    const first = jest.fn()
    const second = jest.fn()
    const view = mountHarness()

    view.instance.setTimeout(first, 30, 'first', 1)
    view.instance.setTimeout(second, 10, {id: 2})

    act(() => jest.advanceTimersByTime(10))
    expect(second).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledWith({id: 2})
    expect(first).not.toHaveBeenCalled()

    act(() => jest.advanceTimersByTime(20))
    expect(first).toHaveBeenCalledTimes(1)
    expect(first).toHaveBeenCalledWith('first', 1)

    view.unmount()
  })

  it('implements the documented interval contract and stops intervals on unmount', () => {
    const callback = jest.fn()
    const view = mountHarness()

    view.instance.setInterval(callback, 20, 'tick')

    act(() => jest.advanceTimersByTime(65))
    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenLastCalledWith('tick')

    view.unmount()
    expect(jest.getTimerCount()).toBe(0)

    act(() => jest.advanceTimersByTime(100))
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('clears every pending timeout and interval when the component unmounts', () => {
    const callbacks = [jest.fn(), jest.fn(), jest.fn(), jest.fn()]
    const view = mountHarness()

    view.instance.setTimeout(callbacks[0], 20)
    view.instance.setTimeout(callbacks[1], 40)
    view.instance.setInterval(callbacks[2], 10)
    view.instance.setInterval(callbacks[3], 15)
    expect(jest.getTimerCount()).toBe(4)

    view.unmount()
    expect(jest.getTimerCount()).toBe(0)

    act(() => jest.advanceTimersByTime(100))
    callbacks.forEach(callback => expect(callback).not.toHaveBeenCalled())
  })

  it('allows pending work to be cancelled manually and repeated clearing is safe', () => {
    const timeout = jest.fn()
    const interval = jest.fn()
    const view = mountHarness()

    view.instance.clearTimer()
    view.instance.setTimeout(timeout, 20)
    view.instance.setInterval(interval, 10)
    view.instance.clearTimer()
    view.instance.clearTimer()

    expect(jest.getTimerCount()).toBe(0)
    act(() => jest.advanceTimersByTime(100))
    expect(timeout).not.toHaveBeenCalled()
    expect(interval).not.toHaveBeenCalled()

    view.unmount()
  })

  it('preserves the original componentWillUnmount receiver and arguments', () => {
    const onUnmount = jest.fn()

    class LifecycleHarness extends Component {
      componentWillUnmount () {
        this.props.onUnmount.apply(this, arguments)
      }

      render () {
        return null
      }
    }

    const TimedLifecycleHarness = withTimer(LifecycleHarness)
    const instance = new TimedLifecycleHarness({onUnmount})
    const callback = jest.fn()
    instance.setTimeout(callback, 10)

    instance.componentWillUnmount('manual', 7)

    expect(onUnmount).toHaveBeenCalledWith('manual', 7)
    expect(onUnmount.mock.contexts[0]).toBe(instance)
    expect(jest.getTimerCount()).toBe(0)

    act(() => jest.advanceTimersByTime(20))
    expect(callback).not.toHaveBeenCalled()
  })

  it('starts a fresh registry after clearing instead of retaining stale timer ids', () => {
    const view = mountHarness()

    view.instance.setTimeout(jest.fn(), 10)
    view.instance.setTimeout(jest.fn(), 20)
    view.instance.setInterval(jest.fn(), 30)
    expect(view.instance.timers).toHaveLength(2)
    expect(view.instance.intervals).toHaveLength(1)

    view.instance.clearTimer()
    expect(view.instance.timers).toEqual([])
    expect(view.instance.intervals).toEqual([])

    view.instance.setTimeout(jest.fn(), 40)
    view.instance.setInterval(jest.fn(), 50)
    expect(view.instance.timers).toHaveLength(1)
    expect(view.instance.intervals).toHaveLength(1)

    view.unmount()
  })
})
