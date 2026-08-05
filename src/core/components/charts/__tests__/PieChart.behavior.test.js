import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'
import PieChart from '../PieChart'

const chart = props => (
  <ConfigContext.Provider value={initialConfigState}>
    <PieChart {...props}/>
  </ConfigContext.Provider>
)

const renderPieChart = props => render(chart(props))
const slicesOf = container => Array.from(container.querySelectorAll('path[data-name]'))
const sliceNames = container => slicesOf(container).map(path => path.getAttribute('data-name'))

const dispatchMouseWithOffset = (target, eventName, offsetX, offsetY) => {
  const nativeEventNames = {
    mouseEnter: 'mouseover',
    mouseMove: 'mousemove',
    mouseLeave: 'mouseout',
  }
  const event = new MouseEvent(nativeEventNames[eventName], {bubbles: true})
  Object.defineProperties(event, {
    offsetX: {value: offsetX},
    offsetY: {value: offsetY},
  })
  fireEvent(target, event)
}

describe('PieChart additional behavioral contracts', () => {
  it('keeps empty and zero-only datasets finite and free of percentage labels', () => {
    const {container, getByText, rerender} = renderPieChart({items: []})

    expect(slicesOf(container)).toHaveLength(0)
    expect(getByText('0')).toBeInTheDocument()
    expect(container.querySelector('svg').textContent).toBe('')

    rerender(chart({
      items: [
        {label: 'Empty A', value: 0},
        {label: 'Empty B', value: 0},
      ],
    }))

    expect(slicesOf(container)).toHaveLength(2)
    slicesOf(container).forEach(path => {
      expect(path.getAttribute('d')).not.toMatch(/NaN|Infinity/)
    })
    expect(container.querySelector('svg').textContent).toBe('')
    expect(getByText('0')).toBeInTheDocument()

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
      rerender(chart({items: null}))
    } finally {
      consoleError.mockRestore()
    }
    expect(slicesOf(container)).toHaveLength(0)
    expect(getByText('0')).toBeInTheDocument()
  })

  it('normalizes malformed values and non-string labels without corrupting geometry or totals', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    let result
    try {
      result = renderPieChart({
        items: [
          {label: 'Valid', value: 10},
          {label: 123, value: 5},
          {label: 'Negative', value: -4},
          {label: 'Not finite', value: NaN},
          {label: 'Infinite', value: Infinity},
          null,
        ],
      })
    } finally {
      consoleError.mockRestore()
    }

    expect(sliceNames(result.container)).toEqual(expect.arrayContaining(['Valid', '123']))
    slicesOf(result.container).forEach(path => {
      expect(path.getAttribute('d')).not.toMatch(/NaN|Infinity/)
    })
    expect(result.getByText('15')).toBeInTheDocument()
  })

  it('draws a finite full-circle donut and a 100% label for one nonzero item', () => {
    const {container, getByText} = renderPieChart({
      items: [{label: 'Everything', value: 25}],
      pointers: false,
    })
    const pathData = slicesOf(container)[0].getAttribute('d')

    expect(pathData).not.toMatch(/NaN|Infinity/)
    expect(pathData.match(/\bA\b/g)).toHaveLength(4)
    expect(getByText('100%')).toBeInTheDocument()
  })

  it('updates controlled pointer presentation and suppresses slices below one percent', () => {
    const items = [
      {label: 'DominantCategory', value: 999},
      {label: 'Tiny', value: 1},
    ]
    const {container, rerender} = renderPieChart({items, pointers: false})

    expect(Array.from(container.querySelectorAll('svg text'), node => node.textContent)).toEqual(['100%'])

    rerender(chart({items, pointers: true}))

    const pointerTexts = Array.from(container.querySelectorAll('svg text'), node => node.textContent)
    expect(pointerTexts).toContain('Domi...ry')
    expect(pointerTexts).toContain('100%')
    expect(pointerTexts).not.toContain('Tiny')
    expect(pointerTexts).not.toContain('0%')
  })

  it('positions, updates, pluralizes and dismisses the hover tooltip', () => {
    const {container} = renderPieChart({
      items: [
        {label: 'One task', value: 1},
        {label: 'Two tasks', value: 2},
        {label: 'No tasks', value: 0},
      ],
      unit: 'day',
    })
    const [one, two, none] = slicesOf(container)

    dispatchMouseWithOffset(one, 'mouseEnter', 12, 18)
    let tooltip = container.querySelector('.app__chart__tooltip')
    expect(tooltip).toHaveStyle({left: '22px', top: '28px'})
    expect(tooltip.textContent).toContain('One task')
    expect(tooltip.textContent).toContain('1 day')

    dispatchMouseWithOffset(one, 'mouseMove', 30, 40)
    tooltip = container.querySelector('.app__chart__tooltip')
    expect(tooltip).toHaveStyle({left: '40px', top: '50px'})

    dispatchMouseWithOffset(one, 'mouseLeave', 30, 40)
    expect(container.querySelector('.app__chart__tooltip')).not.toBeInTheDocument()

    dispatchMouseWithOffset(two, 'mouseEnter', 5, 7)
    expect(container.querySelector('.app__chart__tooltip').textContent).toContain('2 days')

    dispatchMouseWithOffset(none, 'mouseEnter', 8, 9)
    expect(container.querySelector('.app__chart__tooltip').textContent).toContain('No tasks0 days')
  })

  it('keeps an open tooltip synchronized with controlled data updates and removal', () => {
    const {container, rerender} = renderPieChart({
      items: [{label: 'Account', value: 1}],
    })
    dispatchMouseWithOffset(slicesOf(container)[0], 'mouseEnter', 4, 6)
    expect(container.querySelector('.app__chart__tooltip').textContent).toContain('Account1')

    rerender(chart({items: [{label: 'Account', value: 5}]}))
    expect(container.querySelector('.app__chart__tooltip').textContent).toContain('Account5')

    rerender(chart({items: []}))
    expect(container.querySelector('.app__chart__tooltip')).not.toBeInTheDocument()
  })

  it('recomputes sorted slices, colors and total on rerender without mutating inputs', () => {
    const initialItems = [
      {label: 'Beta', value: 2},
      {label: 'Alpha', value: 1},
    ]
    const initialSnapshot = initialItems.map(item => ({...item}))
    const {container, getByText, rerender} = renderPieChart({
      items: initialItems,
      sort: 'value',
      gradient: true,
    })

    expect(sliceNames(container)).toEqual(['Alpha', 'Beta'])
    expect(initialItems).toEqual(initialSnapshot)
    expect(getByText('3')).toBeInTheDocument()

    const nextItems = [
      {label: 'Gamma', value: 4},
      {label: 'Delta', value: 1},
    ]
    rerender(chart({items: nextItems, sort: '-value', gradient: false}))

    expect(sliceNames(container)).toEqual(['Gamma', 'Delta'])
    expect(slicesOf(container).every(path => path.getAttribute('fill').startsWith('#'))).toBe(true)
    expect(getByText('5')).toBeInTheDocument()
    expect(container.querySelector('[data-name="Alpha"]')).not.toBeInTheDocument()
  })

  it('moves controlled legends between bottom and side layouts with the current height offset', () => {
    const items = [{label: 'Legend', value: 1}]
    const {container, rerender} = renderPieChart({
      items,
      height: 300,
      legends: {bottom: true},
    })
    let wrapper = container.querySelector('.app__pie-chart--ref')
    let reference = container.querySelector('.app__pie-chart__ref__items')

    expect(wrapper).toHaveClass('flex--col')
    expect(reference).toHaveStyle({marginTop: '-30px'})

    rerender(chart({items, height: 300, legends: {bottom: false}}))
    wrapper = container.querySelector('.app__pie-chart--ref')
    reference = container.querySelector('.app__pie-chart__ref__items')
    expect(wrapper).toHaveClass('flex--row')
    expect(reference.style.marginTop).toBe('')
  })

  it('tracks ResizeObserver width and reconnects cleanly when height changes', () => {
    let resizeCallback
    const observe = jest.fn()
    const disconnect = jest.fn()
    const originalResizeObserver = global.ResizeObserver
    global.ResizeObserver = jest.fn(function (callback) {
      resizeCallback = callback
      return {observe, disconnect}
    })

    try {
      const {container, rerender, unmount} = renderPieChart({
        items: [{label: 'Measured', value: 1}],
        height: 200,
      })
      expect(observe).toHaveBeenCalledWith(container.querySelector('.app__pie-chart__svg'))

      act(() => resizeCallback([]))
      expect(container.querySelector('svg')).toHaveAttribute('width', '200')

      act(() => resizeCallback([{contentRect: {width: 360}}]))
      expect(container.querySelector('svg')).toHaveAttribute('width', '360')

      rerender(chart({items: [{label: 'Measured', value: 1}], height: 240}))
      expect(disconnect).toHaveBeenCalledTimes(1)
      expect(global.ResizeObserver).toHaveBeenCalledTimes(2)

      unmount()
      expect(disconnect).toHaveBeenCalledTimes(2)
    } finally {
      if (originalResizeObserver === undefined) delete global.ResizeObserver
      else global.ResizeObserver = originalResizeObserver
    }
  })

  it('treats zero as controlled center content instead of falling back to the total', () => {
    const {getByText, queryByText} = renderPieChart({
      items: [{label: 'Value', value: 8}],
      children: 0,
    })

    expect(getByText('0')).toBeInTheDocument()
    expect(queryByText('Total')).not.toBeInTheDocument()
  })
})
