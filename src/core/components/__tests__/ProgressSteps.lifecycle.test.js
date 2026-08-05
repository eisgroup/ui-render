import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProgressSteps from '../ProgressSteps'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
  <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const items = [
  {step: 'A', label: 'First', content: 'First content'},
  {step: 'B', label: 'Second', content: 'Second content'},
  {step: 'C', label: 'Third', content: 'Third content'},
  {step: 'D', label: 'Fourth', content: 'Fourth content'},
]

const getStepButtons = (container) => container.querySelectorAll('.app__progress__step button')

describe('ProgressSteps additional contracts', () => {
  beforeEach(() => jest.useFakeTimers())

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('prefers an explicit controlled zero index over defaultIndex', () => {
    const {queryByText} = render(wrap(
      <ProgressSteps items={items} activeIndex={0} defaultIndex={2}/>
    ))

    expect(queryByText('First content')).toBeInTheDocument()
    expect(queryByText('Third content')).not.toBeInTheDocument()
  })

  it('synchronizes controlled activeIndex rerenders without reporting a user change', () => {
    const onChange = jest.fn()
    const view = render(wrap(
      <ProgressSteps items={items} activeIndex={0} onChange={onChange}/>
    ))

    view.rerender(wrap(
      <ProgressSteps items={items} activeIndex='2' onChange={onChange}/>
    ))

    expect(view.queryByText('Third content')).toBeInTheDocument()
    expect(view.container.querySelectorAll('.app__progress__step')[2]).toHaveClass('active')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('cancels a pending click when a controlled activeIndex rerender takes precedence', () => {
    const onChange = jest.fn()
    const view = render(wrap(
      <ProgressSteps items={items} activeIndex={0} onChange={onChange}/>
    ))

    fireEvent.click(getStepButtons(view.container)[1])
    view.rerender(wrap(
      <ProgressSteps items={items} activeIndex={2} onChange={onChange}/>
    ))
    act(() => jest.advanceTimersByTime(50))

    expect(view.queryByText('Third content')).toBeInTheDocument()
    expect(view.queryByText('Second content')).not.toBeInTheDocument()
    expect(view.container.querySelectorAll('.app__progress__step')[2]).toHaveClass('active')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('returns to the first step when the item list shrinks below the active index', () => {
    const view = render(wrap(<ProgressSteps items={items} defaultIndex={3}/>))

    view.rerender(wrap(<ProgressSteps items={items.slice(0, 2)} defaultIndex={3}/>))

    expect(view.queryByText('First content')).toBeInTheDocument()
    expect(view.container.querySelectorAll('.app__progress__step')[0]).toHaveClass('active')
  })

  it('does not activate or report a step removed during its pending transition', () => {
    const onChange = jest.fn()
    const view = render(wrap(<ProgressSteps items={items} onChange={onChange}/>))

    fireEvent.click(getStepButtons(view.container)[3])
    view.rerender(wrap(<ProgressSteps items={items.slice(0, 2)} onChange={onChange}/>))
    act(() => jest.advanceTimersByTime(50))

    expect(view.queryByText('First content')).toBeInTheDocument()
    expect(view.container.querySelectorAll('.app__progress__step')[0]).toHaveClass('active')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('changes content and invokes onChange only when the click transition finishes', () => {
    const onChange = jest.fn()
    const view = render(wrap(<ProgressSteps items={items} onChange={onChange}/>))

    fireEvent.click(getStepButtons(view.container)[1])

    expect(view.queryByText('First content')).toBeInTheDocument()
    expect(view.queryByText('Second content')).not.toBeInTheDocument()
    expect(view.container.querySelector('.tabs__content')).not.toHaveClass('fade-in')
    expect(onChange).not.toHaveBeenCalled()

    act(() => jest.advanceTimersByTime(49))
    expect(onChange).not.toHaveBeenCalled()

    act(() => jest.advanceTimersByTime(1))
    expect(view.queryByText('Second content')).toBeInTheDocument()
    expect(view.container.querySelector('.tabs__content')).toHaveClass('fade-in')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('allows navigation when the optional onChange callback is omitted', () => {
    const view = render(wrap(<ProgressSteps items={items}/>))

    fireEvent.click(getStepButtons(view.container)[1])
    act(() => jest.advanceTimersByTime(50))

    expect(view.queryByText('Second content')).toBeInTheDocument()
  })

  it.each([
    ['text', 'Plain content', 'Plain content'],
    ['number', 0, '0'],
    ['React node', <strong>Node content</strong>, 'Node content'],
  ])('renders %s content', (_type, content, expected) => {
    const {queryByText} = render(wrap(
      <ProgressSteps items={[{content}]}/>
    ))

    expect(queryByText(expected)).toBeInTheDocument()
  })

  it('calls lazy content and omits the content container for a null result', () => {
    let contentCalls = 0
    const content = () => {
      contentCalls += 1
      return <strong>Lazy content</strong>
    }
    const view = render(wrap(<ProgressSteps items={[{content}]}/>))

    expect(view.queryByText('Lazy content')).toBeInTheDocument()
    expect(contentCalls).toBe(1)

    view.rerender(wrap(<ProgressSteps items={[{content: null}]}/>))
    expect(view.container.querySelector('.tabs__content')).not.toBeInTheDocument()
  })

  it('cancels a pending transition when unmounted', () => {
    const onChange = jest.fn()
    const view = render(wrap(<ProgressSteps items={items} onChange={onChange}/>))

    fireEvent.click(getStepButtons(view.container)[1])
    view.unmount()
    act(() => jest.advanceTimersByTime(50))

    expect(onChange).not.toHaveBeenCalled()
  })
})
