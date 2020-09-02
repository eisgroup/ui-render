import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import Expand from 'react-ui-pack/Expand'

// Setup test
beforeEach(() => {
  jest.useFakeTimers()
})

// Cleanup test
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe(`<${Expand.name}/>`, () => {
  const title = 'Expandable Title'
  const content = 'Expanded content.'
  it(`renders title but no content when collapsed by default`, () => {
    render(<Expand title={title}>{content}</Expand>)
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.queryByText(content)).toBeNull()
  })
  it(`renders title and content when expanded`, () => {
    render(<Expand title={title} expanded>{content}</Expand>)
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByText(content)).toBeInTheDocument()
  })
  it(`toggles content expansion/collapse with animation when clicked`, () => {
    const duration = 500 // animation duration
    render(<Expand title={title} duration={duration}>{content}</Expand>)
    const expandable = screen.getByText(title)
    expect(screen.queryByText(content)).toBeNull()
    fireEvent.click(expandable)
    expect(screen.getByText(content)).toBeInTheDocument()
    fireEvent.click(expandable)
    // Content should be in the DOM while collapse animates
    expect(screen.getByText(content)).toBeInTheDocument()
    // Fast-forward time until collapse animation has finished
    jest.advanceTimersByTime(duration)
    // Content should be removed from DOM when collapse animation finished
    expect(screen.queryByText(content)).toBeNull()
  })
  it(`lazy loads content - only calls children function when expanded`, () => {
    const lazy = 'Lazy'
    const rendering = jest.fn() // jest complains that React children cannot be function if mocked directly
    const children = () => rendering() || lazy + content
    render(<Expand title={title}>{children}</Expand>)
    expect(rendering).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText(title))
    expect(screen.getByText(lazy + content)).toBeInTheDocument()
    expect(rendering).toHaveBeenCalled()
  })
  test(`'renderLabel' outputs custom label and overrides 'title'`, () => {
    const label = 'Label'
    const renderLabel = (title) => label + title
    render(<Expand title={title} renderLabel={renderLabel}>{content}</Expand>)
    expect(screen.queryByText(title)).toBeNull()
    expect(screen.getByText(label + title)).toBeInTheDocument()
  })
  test(`'onClick' gets called with correct arguments`, () => {
    const index = 7
    const id = 'ID'
    let args
    const onClick = (arg) => args = arg
    render(<Expand title={title} onClick={onClick} id={id} index={index}>{content}</Expand>)
    fireEvent.click(screen.getByText(title))
    expect(args).toEqual({expanded: true, index, key: id, value: title})
  })
  test(`'className', 'classNameLabel' and 'classNameItems' get applied`, () => {
    const className = 'padding-h'
    const classNameLabel = 'margin-h'
    const classNameItems = 'margin-v'
    const props = {className, classNameLabel, classNameItems}
    render(<Expand title={title} expanded {...props}>{content}</Expand>)
    const expandable = screen.getByText(title)
    const expandableContent = screen.getByText(content)
    expect(expandable).toHaveClass(classNameLabel)
    expect(expandableContent.parentElement).toHaveClass(classNameItems)
    expect(expandableContent.parentElement.parentElement).toHaveClass(className)
  })
})
