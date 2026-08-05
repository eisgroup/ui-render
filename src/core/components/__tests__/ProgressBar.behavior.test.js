import React from 'react'
import {act, fireEvent, render} from '@testing-library/react'
import '@testing-library/jest-dom'
import ProgressBar from '../ProgressBar'
import {ConfigContext, initialConfigState} from '../../contexts/ConfigContext'
import {TIME_DURATION_INSTANT} from '../../utils'

const wrap = ui => (
  <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const renderProgressBar = (props = {}) => render(wrap(
  <ProgressBar value={0.5} {...props}/>
))

const getBar = container => container.querySelector('.app__progress__bar')
const getRoot = container => container.querySelector('.app__progress--bar')
const getTooltip = container => container.querySelector('.app__progress__bar__tooltip__inner')
const CustomTooltip = () => <strong>Half complete</strong>

describe('ProgressBar lifecycle contracts', () => {
  beforeEach(() => jest.useFakeTimers())

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('applies the initial value only after the mount delay', () => {
    const progress = React.createRef()
    const view = renderProgressBar({value: 0.42, hasTooltip: true, ref: progress})

    expect(getBar(view.container)).toHaveStyle({width: '0%'})
    expect(getTooltip(view.container)).toHaveTextContent('0%')
    expect(progress.current.timers).toHaveLength(1)

    act(() => jest.advanceTimersByTime(TIME_DURATION_INSTANT - 1))
    expect(getBar(view.container)).toHaveStyle({width: '0%'})

    act(() => jest.advanceTimersByTime(1))
    expect(getBar(view.container)).toHaveStyle({width: '42%'})
    expect(getTooltip(view.container)).toHaveTextContent('42%')
  })

  it('cleans up the delayed mount update on unmount', () => {
    const progress = React.createRef()
    const view = renderProgressBar({value: 0.8, ref: progress})
    const instance = progress.current

    expect(instance.timers).toHaveLength(1)
    view.unmount()

    expect(instance.timers).toEqual([])
  })

  it('does not let the delayed mount value overwrite a newer prop', () => {
    const progress = React.createRef()
    const view = renderProgressBar({value: 0.2, ref: progress})

    view.rerender(wrap(<ProgressBar ref={progress} value={0.75}/>))
    expect(getBar(view.container)).toHaveStyle({width: '75%'})
    expect(progress.current.timers).toEqual([])

    act(() => jest.runAllTimers())
    expect(getBar(view.container)).toHaveStyle({width: '75%'})
  })

  it('settles on the latest value across rapid prop updates', () => {
    const view = renderProgressBar({value: 0.1})

    view.rerender(wrap(<ProgressBar value={0.3}/>))
    view.rerender(wrap(<ProgressBar value={0}/>))
    view.rerender(wrap(<ProgressBar value={0.9}/>))

    expect(getBar(view.container)).toHaveStyle({width: '90%'})
    act(() => jest.runAllTimers())
    expect(getBar(view.container)).toHaveStyle({width: '90%'})
  })

  it('keeps the pending mount update when an unrelated prop changes', () => {
    const progress = React.createRef()
    const view = renderProgressBar({value: 0.6, className: 'before', ref: progress})

    view.rerender(wrap(<ProgressBar ref={progress} value={0.6} className='after'/>))

    expect(getRoot(view.container)).toHaveClass('after')
    expect(getBar(view.container)).toHaveStyle({width: '0%'})
    expect(progress.current.timers).toHaveLength(1)

    act(() => jest.runAllTimers())
    expect(getBar(view.container)).toHaveStyle({width: '60%'})
  })

  it('supports an explicit zero value', () => {
    const view = renderProgressBar({value: 0, hasTooltip: true})

    act(() => jest.runAllTimers())

    expect(getBar(view.container)).toHaveStyle({width: '0%'})
    expect(getTooltip(view.container)).toHaveTextContent('0%')
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['NaN', Number.NaN],
    ['a negative number', -0.25],
  ])('renders %s as empty progress with a no-data tooltip', (_name, value) => {
    const progress = React.createRef()
    const view = renderProgressBar({value, hasTooltip: true, ref: progress})

    expect(getBar(view.container)).toHaveStyle({width: '0%'})
    expect(getTooltip(view.container)).toHaveTextContent('No Data')
    expect(progress.current.timers || []).toEqual([])
  })

  it('renders the documented upper fraction boundary as complete', () => {
    const view = renderProgressBar({value: 1, hasTooltip: true})

    act(() => jest.runAllTimers())

    expect(getBar(view.container)).toHaveStyle({width: '100%'})
    expect(getTooltip(view.container)).toHaveTextContent('100%')
  })

  it('normalizes an invalid prop update and cancels pending mount work', () => {
    const progress = React.createRef()
    const view = renderProgressBar({value: 0.4, hasTooltip: true, ref: progress})

    view.rerender(wrap(<ProgressBar ref={progress} value={Number.NaN} hasTooltip/>))

    expect(getBar(view.container)).toHaveStyle({width: '0%'})
    expect(getTooltip(view.container)).toHaveTextContent('No Data')
    expect(progress.current.timers).toEqual([])
  })
})

describe('ProgressBar presentation contracts', () => {
  beforeEach(() => jest.useFakeTimers())

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('rounds fractional percentages and positions the tooltip from the rendered value', () => {
    const view = renderProgressBar({value: 0.456, hasTooltip: true})

    act(() => jest.runAllTimers())

    expect(getBar(view.container)).toHaveStyle({width: '46%'})
    expect(getTooltip(view.container)).toHaveTextContent('46%')
    expect(getTooltip(view.container)).toHaveStyle({transform: `translateX(${(0.5 - 0.456) * 50}%)`})
  })

  it('uses custom children as tooltip content, including zero', () => {
    const nodeView = renderProgressBar({
      value: 0.5,
      hasTooltip: true,
      children: <CustomTooltip/>,
    })
    act(() => jest.runAllTimers())
    expect(nodeView.getByText('Half complete')).toBeInTheDocument()

    nodeView.rerender(wrap(
      <ProgressBar value={0.5} hasTooltip>{0}</ProgressBar>
    ))
    expect(getTooltip(nodeView.container)).toHaveTextContent('0')
    expect(getTooltip(nodeView.container)).not.toHaveTextContent('50%')
  })

  it('renders labels, including a numeric zero label', () => {
    const view = renderProgressBar({value: 0.5, label: 'Loading'})

    expect(view.getByText('Loading')).toBeInTheDocument()

    view.rerender(wrap(<ProgressBar value={0.5} label={0}/>))
    expect(getBar(view.container)).toHaveTextContent('0')
  })

  it('combines the calculated width with bar styles and gives color final precedence', () => {
    const view = renderProgressBar({
      value: 0.5,
      color: 'rgb(255, 0, 0)',
      styleBar: {
        width: '33%',
        minHeight: '4px',
        backgroundColor: 'rgb(0, 0, 255)',
      },
    })

    expect(getBar(view.container)).toHaveStyle({
      width: '33%',
      minHeight: '4px',
      backgroundColor: 'rgb(255, 0, 0)',
    })
  })

  it('forwards host props and outer styles while keeping the default gradient', () => {
    const onClick = jest.fn()
    const view = renderProgressBar({
      className: 'custom-progress',
      'data-testid': 'progress-root',
      'aria-label': 'Upload progress',
      style: {opacity: 0.5},
      onClick,
    })
    const root = view.getByTestId('progress-root')

    expect(root).toHaveClass('app__progress--bar', 'custom-progress', 'gradient')
    expect(root).toHaveAttribute('aria-label', 'Upload progress')
    expect(root).toHaveStyle({opacity: '0.5'})
    fireEvent.click(root)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('updates the gradient class without disturbing progress', () => {
    const view = renderProgressBar({value: 0.7})
    act(() => jest.runAllTimers())

    view.rerender(wrap(<ProgressBar value={0.7} gradient={false}/>))

    expect(getRoot(view.container)).not.toHaveClass('gradient')
    expect(getBar(view.container)).toHaveStyle({width: '70%'})
  })

  it('does not render a tooltip unless requested', () => {
    const view = renderProgressBar({value: 0.5, children: 'Hidden tooltip'})

    expect(view.queryByText('Hidden tooltip')).not.toBeInTheDocument()
    expect(view.container.querySelector('.app__progress__bar__tooltip')).not.toBeInTheDocument()
  })

  it('does not leak component-only props to the root DOM node', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const view = renderProgressBar({
      value: 0.5,
      label: 'Loading',
      hasTooltip: true,
      color: 'red',
      gradient: false,
      styleBar: {height: '5px'},
      children: 'Half',
    })
    const root = getRoot(view.container)

    expect(root).not.toHaveAttribute('value')
    expect(root).not.toHaveAttribute('label')
    expect(root).not.toHaveAttribute('hastooltip')
    expect(root).not.toHaveAttribute('color')
    expect(root).not.toHaveAttribute('gradient')
    expect(root).not.toHaveAttribute('stylebar')
    expect(consoleError).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
