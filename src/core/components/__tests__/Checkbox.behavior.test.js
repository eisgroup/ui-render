import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Checkbox } from '../Checkbox'

describe('Checkbox interaction contract', () => {
  it('maps controlled custom true and false values to checked state', () => {
    const onChange = jest.fn()
    const { container, rerender } = render(
      <Checkbox
        id="status"
        value="enabled"
        valueTrue="enabled"
        valueFalse="disabled"
        onChange={onChange}
      />
    )
    const input = container.querySelector('input')

    expect(input).toBeChecked()
    fireEvent.click(input)
    expect(onChange).toHaveBeenLastCalledWith('disabled', undefined, expect.any(Object))

    rerender(
      <Checkbox
        id="status"
        value="disabled"
        valueTrue="enabled"
        valueFalse="disabled"
        onChange={onChange}
      />
    )
    expect(input).not.toBeChecked()
    fireEvent.click(input)
    expect(onChange).toHaveBeenLastCalledWith('enabled', undefined, expect.any(Object))
  })

  it('keeps its own state when only defaultValue is supplied', () => {
    const onChange = jest.fn()
    const { container } = render(
      <Checkbox id="newsletter" defaultValue onChange={onChange} />
    )
    const input = container.querySelector('input')

    expect(input).toBeChecked()
    expect(input.defaultChecked).toBe(true)

    fireEvent.click(input)
    expect(input).not.toBeChecked()
    expect(onChange).toHaveBeenLastCalledWith(false, undefined, expect.any(Object))

    fireEvent.click(input)
    expect(input).toBeChecked()
    expect(onChange).toHaveBeenLastCalledWith(true, undefined, expect.any(Object))
  })

  it.each([
    ['zero', 0, false],
    ['an empty string', '', false],
    ['a non-empty string', 'false', true],
    ['an object', { selected: false }, true]
  ])('coerces %s using the established boolean value contract', (_name, value, checked) => {
    const { container } = render(
      <Checkbox id="coerced" value={value} onChange={() => {}} />
    )

    expect(container.querySelector('input').checked).toBe(checked)
  })

  it('supports zero and empty string as custom mapped values', () => {
    const onChange = jest.fn()
    const { container, rerender } = render(
      <Checkbox
        id="numeric-state"
        value={0}
        valueTrue={0}
        valueFalse=""
        onChange={onChange}
      />
    )
    const input = container.querySelector('input')

    expect(input).toBeChecked()
    fireEvent.click(input)
    expect(onChange).toHaveBeenLastCalledWith('', undefined, expect.any(Object))

    rerender(
      <Checkbox
        id="numeric-state"
        value=""
        valueTrue={0}
        valueFalse=""
        onChange={onChange}
      />
    )
    expect(input).not.toBeChecked()
    fireEvent.click(input)
    expect(onChange).toHaveBeenLastCalledWith(0, undefined, expect.any(Object))
  })

  it('passes the mapped value, field name, and native change target to onChange', () => {
    let call
    const onChange = jest.fn((nextValue, name, event) => {
      call = {
        nextValue,
        name,
        eventType: event.type,
        target: event.target,
        checked: event.target.checked
      }
    })
    const { container } = render(
      <Checkbox id="terms" name="termsAccepted" onChange={onChange} />
    )
    const input = container.querySelector('input')

    fireEvent.click(input)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(call).toEqual({
      nextValue: true,
      name: 'termsAccepted',
      eventType: 'change',
      target: input,
      checked: true
    })
    expect(input).toHaveAttribute('name', 'termsAccepted')
  })

  it('derives an id from the label and associates the label with the input', () => {
    const { container, getByLabelText } = render(
      <Checkbox label="Accept terms" onChange={() => {}} />
    )
    const input = getByLabelText('Accept terms')
    const label = container.querySelector('label')

    expect(input).toHaveAttribute('id', 'checkbox-Accept-terms')
    expect(label).toHaveAttribute('for', 'checkbox-Accept-terms')
  })

  it('uses an explicit id as the visible fallback label', () => {
    const { container, getByLabelText } = render(
      <Checkbox id="accept-terms" onChange={() => {}} />
    )

    expect(getByLabelText('accept-terms')).toBe(container.querySelector('input'))
  })

  it('translates toggle labels and title while preserving style classes', () => {
    const translate = jest.fn(value => value == null ? value : `translated:${value}`)
    const { container, getByTitle } = render(
      <Checkbox
        id="feature"
        type="toggle"
        title="Feature switch"
        labelTrue="Available"
        labelFalse="Unavailable"
        danger
        className="settings-control"
        translate={translate}
        onChange={() => {}}
      />
    )
    const wrapper = container.firstChild
    const input = container.querySelector('input')
    const label = getByTitle('translated:Feature switch')

    expect(wrapper).toHaveClass('flex--row', 'checkbox--wrapper', 'settings-control')
    expect(input).toHaveAttribute('type', 'checkbox')
    expect(input).toHaveClass('checkbox', 'toggle')
    expect(label).toHaveClass('flex--row', 'middle', 'justify', 'danger')
    expect(container.querySelector('.checkbox__true')).toHaveTextContent('translated:Available')
    expect(container.querySelector('.checkbox__button')).toBeEmptyDOMElement()
    expect(container.querySelector('.checkbox__false')).toHaveTextContent('translated:Unavailable')
    expect(translate).toHaveBeenCalledWith('Feature switch')
    expect(translate).toHaveBeenCalledWith('Available')
    expect(translate).toHaveBeenCalledWith('Unavailable')
  })

  it('falls back to the common label and default toggle text', () => {
    const { container, rerender } = render(
      <Checkbox id="shared-label" type="toggle" label="State" onChange={() => {}} />
    )

    expect(container.querySelector('.checkbox__true')).toHaveTextContent('State')
    expect(container.querySelector('.checkbox__false')).toHaveTextContent('State')

    rerender(<Checkbox id="default-labels" type="toggle" onChange={() => {}} />)
    expect(container.querySelector('.checkbox__true')).toHaveTextContent('ON')
    expect(container.querySelector('.checkbox__false')).toHaveTextContent('OFF')
  })

  it('updates controlled state, labels, title, and classes across rerenders', () => {
    const onChange = jest.fn()
    const { container, rerender } = render(
      <Checkbox
        id="dynamic"
        value="yes"
        valueTrue="yes"
        valueFalse="no"
        label="First"
        title="Old title"
        className="old-class"
        onChange={onChange}
      />
    )
    const input = container.querySelector('input')

    expect(input).toBeChecked()
    expect(container.querySelector('label')).toHaveTextContent('First')
    expect(container.querySelector('label')).toHaveAttribute('title', 'Old title')

    rerender(
      <Checkbox
        id="dynamic"
        value="no"
        valueTrue="yes"
        valueFalse="no"
        type="toggle"
        labelTrue="Ready"
        labelFalse="Waiting"
        title="New title"
        className="new-class"
        danger
        onChange={onChange}
      />
    )

    expect(input).not.toBeChecked()
    expect(input).toHaveClass('toggle')
    expect(container.firstChild).toHaveClass('new-class')
    expect(container.firstChild).not.toHaveClass('old-class')
    expect(container.querySelector('label')).toHaveAttribute('title', 'New title')
    expect(container.querySelector('label')).toHaveClass('danger')
    expect(container.querySelector('.checkbox__true')).toHaveTextContent('Ready')
    expect(container.querySelector('.checkbox__false')).toHaveTextContent('Waiting')
  })

  it('exposes readOnly to the DOM and remains inert when clicked directly or by label', () => {
    const onChange = jest.fn()
    const onClick = jest.fn()
    const { container, getByText } = render(
      <Checkbox
        label="Locked"
        readonly
        defaultValue={false}
        onClick={onClick}
        onChange={onChange}
      />
    )
    const input = container.querySelector('input')

    expect(input).toHaveProperty('readOnly', true)
    expect(input).toHaveAttribute('readonly')
    expect(input).not.toBeDisabled()

    fireEvent.click(input)
    expect(input).not.toBeChecked()

    fireEvent.click(getByText('Locked'))
    expect(input).not.toBeChecked()
    expect(onChange).not.toHaveBeenCalled()
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
