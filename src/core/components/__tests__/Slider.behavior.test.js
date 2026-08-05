import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Slider } from '../Slider'

const handleAt = (container, index = 0) => container.querySelectorAll('[role="slider"]')[index]
const railOf = container => container.querySelector('.app__slider__rail')

const setTrackRect = (container, rect) => {
  railOf(container).getBoundingClientRect = () => rect
}

const dispatchPointer = (target, type, {clientX = 0, clientY = 0} = {}) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
  })
  fireEvent(target, event)
  return event
}

describe('Slider risk-oriented behavior', () => {
  it('commits pointer movement during a drag and detaches listeners on pointerup', () => {
    const onChange = jest.fn()
    const {container} = render(
      <Slider value={10} min={0} max={100} step={10} name='volume' onChange={onChange}/>
    )
    setTrackRect(container, {left: 10, top: 0, width: 200, height: 10})

    dispatchPointer(handleAt(container), 'pointerdown', {clientX: 30})
    expect(container.firstElementChild).toHaveClass('dragging')

    // A replacement pointerdown must remove the first pair of global listeners.
    dispatchPointer(handleAt(container), 'pointerdown', {clientX: 30})
    onChange.mockClear()
    dispatchPointer(window, 'pointermove', {clientX: 150})
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(70, 'volume')

    dispatchPointer(window, 'pointerup')
    expect(container.firstElementChild).not.toHaveClass('dragging')

    onChange.mockClear()
    dispatchPointer(window, 'pointermove', {clientX: 210})
    expect(onChange).not.toHaveBeenCalled()
  })

  it('maps vertical pointer movement from bottom to top and clamps outside the rail', () => {
    const onChange = jest.fn()
    const {container} = render(
      <Slider value={0} min={0} max={100} step={5} vertical onChange={onChange}/>
    )
    setTrackRect(container, {left: 0, top: 100, width: 10, height: 200})

    dispatchPointer(railOf(container), 'pointerdown', {clientY: 150})
    expect(onChange).toHaveBeenLastCalledWith(75, undefined)

    dispatchPointer(window, 'pointermove', {clientY: 400})
    expect(onChange).toHaveBeenLastCalledWith(0, undefined)
    dispatchPointer(window, 'pointerup')
  })

  it('snaps a range click to a discrete mark and moves the nearer right handle', () => {
    const onChange = jest.fn()
    const {container} = render(
      <Slider
        value={[10, 100]}
        min={10}
        max={5000}
        step={null}
        marks={{
          10: {label: '10'},
          100: {label: '100'},
          1000: {label: '1000'},
          5000: {label: '5000'},
        }}
        onChange={onChange}
      />
    )
    setTrackRect(container, {left: 0, top: 0, width: 300, height: 10})

    dispatchPointer(railOf(container), 'pointerdown', {clientX: 200})

    expect(onChange).toHaveBeenLastCalledWith([10, 1000], undefined)
    dispatchPointer(window, 'pointerup')
  })

  it('stays stable with collapsed bounds and zero-sized track geometry without an onChange handler', () => {
    const {container} = render(<Slider value={10} min={10} max={10} vertical/>)
    setTrackRect(container, {left: 50, top: 0, width: 0, height: 0})

    expect(handleAt(container)).toHaveStyle({bottom: '0%'})
    expect(container.querySelector('.app__slider__track')).toHaveStyle({height: '0%'})
    expect(() => dispatchPointer(railOf(container), 'pointerdown', {clientY: 500})).not.toThrow()
    expect(container.firstElementChild).toHaveClass('dragging')

    dispatchPointer(window, 'pointerup')
    expect(container.firstElementChild).not.toHaveClass('dragging')
  })

  it.each([
    ['disabled', {disabled: true}],
    ['readonly', {readonly: true}],
  ])('does not respond to pointer or keyboard input while %s', (state, stateProps) => {
    const onChange = jest.fn()
    const {container} = render(
      <Slider value={50} min={0} max={100} step={5} onChange={onChange} {...stateProps}/>
    )
    setTrackRect(container, {left: 0, top: 0, width: 100, height: 10})
    const handle = handleAt(container)

    dispatchPointer(handle, 'pointerdown', {clientX: 75})
    fireEvent.keyDown(handle, {key: 'ArrowRight'})

    expect(onChange).not.toHaveBeenCalled()
    expect(container.firstElementChild).not.toHaveClass('dragging')
  })

  it('moves to the adjacent discrete mark when the controlled value is between marks', () => {
    const onChange = jest.fn()
    const {container} = render(
      <Slider
        value={60}
        min={0}
        max={100}
        step={null}
        marks={{0: {label: '0'}, 50: {label: '50'}, 100: {label: '100'}}}
        onChange={onChange}
      />
    )

    // The handle is visually snapped to 50, so ArrowRight advances one visual step to 100.
    expect(handleAt(container)).toHaveStyle({left: '50%'})
    fireEvent.keyDown(handleAt(container), {key: 'ArrowRight'})

    expect(onChange).toHaveBeenCalledWith(100, undefined)
  })

  it('ignores unsupported keyboard input without preventing the browser default', () => {
    const onChange = jest.fn()
    const {container} = render(<Slider value={40} onChange={onChange}/>)
    const event = new KeyboardEvent('keydown', {
      key: 'PageUp',
      bubbles: true,
      cancelable: true,
    })

    fireEvent(handleAt(container), event)

    expect(event.defaultPrevented).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps the current value when discrete keyboard input has no snap points', () => {
    const onChange = jest.fn()
    const {container} = render(
      <Slider value={40} min={0} max={100} step={null} marks={{}} onChange={onChange}/>
    )

    fireEvent.keyDown(handleAt(container), {key: 'ArrowRight'})

    expect(onChange).toHaveBeenCalledWith(40, undefined)
  })

  it('computes rangeOptions snap points without mutating frozen label options', () => {
    const rangeLabels = Object.freeze({formatLabel: value => `${value} kg`})
    const {container, getByText} = render(
      <Slider value={20} rangeOptions={[10, 30]} rangeLabels={rangeLabels}/>
    )

    expect(container.querySelectorAll('.app__slider__dot')).toHaveLength(3)
    expect(getByText('20 kg')).toBeInTheDocument()
    expect(rangeLabels).toEqual({formatLabel: expect.any(Function)})
  })

  it.each([
    {scenario: 'short durations', range: [100, 500], rangeLabels: {isTime: true}, expectedLabel: '100 ms'},
    {scenario: 'long durations', range: [1000, 2000], rangeLabels: {isTime: true}, expectedLabel: '1 second'},
    {scenario: 'default currency', range: [10, 30, 90], rangeLabels: {isCurrency: true}, expectedLabel: '$ 10'},
    {scenario: 'custom currency', range: [10, 30, 90], rangeLabels: {isCurrency: true, currency: '€'}, expectedLabel: '€ 10'},
    {scenario: 'percentages', range: [0, 50, 100], rangeLabels: {isPercent: true, precision: 0}, expectedLabel: '50%'},
  ])('formats $scenario in generated range labels', ({range, rangeLabels, expectedLabel}) => {
    const {getByText} = render(
      <Slider value={range[0]} range={range} rangeLabels={rangeLabels}/>
    )

    expect(getByText(expectedLabel)).toBeInTheDocument()
  })

  it('detaches global drag listeners when unmounted before pointerup', () => {
    const onChange = jest.fn()
    const {container, unmount} = render(
      <Slider value={10} min={0} max={100} step={1} onChange={onChange}/>
    )
    setTrackRect(container, {left: 0, top: 0, width: 100, height: 10})

    dispatchPointer(handleAt(container), 'pointerdown', {clientX: 10})
    onChange.mockClear()
    unmount()

    dispatchPointer(window, 'pointermove', {clientX: 90})
    const callsAfterUnmount = onChange.mock.calls.length
    // Always release the old listener so a failed assertion cannot leak into another test.
    dispatchPointer(window, 'pointerup')

    expect(callsAfterUnmount).toBe(0)
  })
})
