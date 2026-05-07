import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'
import PieChart from '../PieChart'

// jsdom has no ResizeObserver — the component falls back to a square chart of `height`.

const renderPieChart = (props) =>
    render(
        <ConfigContext.Provider value={initialConfigState}>
            <PieChart {...props} />
        </ConfigContext.Provider>
    )

const sampleItems = [
    { label: 'Engineering', value: 42 },
    { label: 'Design', value: 18 },
    { label: 'Marketing', value: 12 },
]

describe('PieChart', () => {
    describe('rendering', () => {
        it('renders without crashing', () => {
            const { container } = renderPieChart({ items: sampleItems })
            expect(container.firstChild).toBeInTheDocument()
        })

        it('renders an SVG donut chart', () => {
            const { container } = renderPieChart({ items: sampleItems })
            expect(container.querySelector('svg')).toBeInTheDocument()
        })

        it('renders one slice path per data item', () => {
            const { container } = renderPieChart({ items: sampleItems })
            const slices = container.querySelectorAll('path[data-name]')
            expect(slices).toHaveLength(sampleItems.length)
        })

        it('binds slice data-name to the item label', () => {
            const { container } = renderPieChart({ items: sampleItems })
            const names = Array.from(container.querySelectorAll('path[data-name]'))
                .map((p) => p.getAttribute('data-name'))
            expect(names).toEqual(['Engineering', 'Design', 'Marketing'])
        })
    })

    describe('height prop', () => {
        it('uses default height of 290 on the SVG', () => {
            const { container } = renderPieChart({ items: sampleItems })
            expect(container.querySelector('svg')).toHaveAttribute('height', '290')
        })

        it('respects custom height', () => {
            const { container } = renderPieChart({ items: sampleItems, height: 400 })
            expect(container.querySelector('svg')).toHaveAttribute('height', '400')
        })
    })

    describe('total display', () => {
        it('shows total by default', () => {
            renderPieChart({ items: sampleItems })
            expect(screen.getByText('Total')).toBeInTheDocument()
        })

        it('shows correct total value', () => {
            renderPieChart({ items: sampleItems })
            // 42 + 18 + 12 = 72
            expect(screen.getByText('72')).toBeInTheDocument()
        })

        it('renders custom children instead of total', () => {
            renderPieChart({
                items: sampleItems,
                children: <span data-testid="custom-child">Custom</span>,
            })
            expect(screen.getByTestId('custom-child')).toBeInTheDocument()
            expect(screen.queryByText('Total')).not.toBeInTheDocument()
        })

        it('renders string children inside Text', () => {
            renderPieChart({ items: sampleItems, children: 'Label Text' })
            expect(screen.getByText('Label Text')).toBeInTheDocument()
            expect(screen.queryByText('Total')).not.toBeInTheDocument()
        })
    })

    describe('className and style', () => {
        it('applies custom className', () => {
            const { container } = renderPieChart({ items: sampleItems, className: 'my-chart' })
            expect(container.querySelector('.my-chart')).toBeInTheDocument()
        })

        it('always has app__pie-chart class', () => {
            const { container } = renderPieChart({ items: sampleItems })
            expect(container.querySelector('.app__pie-chart')).toBeInTheDocument()
        })

        it('adds gradient class by default', () => {
            const { container } = renderPieChart({ items: sampleItems })
            expect(container.querySelector('.gradient')).toBeInTheDocument()
        })

        it('does not add gradient class when gradient=false', () => {
            const { container } = renderPieChart({ items: sampleItems, gradient: false })
            expect(container.querySelector('.gradient')).not.toBeInTheDocument()
        })
    })

    describe('gradient', () => {
        it('renders defs with gradient definitions by default', () => {
            const { container } = renderPieChart({ items: sampleItems })
            const gradients = container.querySelectorAll('linearGradient')
            expect(gradients).toHaveLength(sampleItems.length)
        })

        it('does not render gradient defs when gradient=false', () => {
            const { container } = renderPieChart({ items: sampleItems, gradient: false })
            const gradients = container.querySelectorAll('linearGradient')
            expect(gradients).toHaveLength(0)
        })

        it('slice fill uses gradient URL when gradient=true', () => {
            const { container } = renderPieChart({ items: sampleItems })
            const path = container.querySelector('path[data-name]')
            expect(path.getAttribute('fill')).toMatch(/^url\(#pc-/)
        })

        it('slice fill uses color directly when gradient=false', () => {
            const { container } = renderPieChart({ items: sampleItems, gradient: false })
            const path = container.querySelector('path[data-name]')
            expect(path.getAttribute('fill')).toMatch(/^#/)
        })
    })

    describe('legends', () => {
        it('does not render legends by default', () => {
            const { container } = renderPieChart({ items: sampleItems })
            expect(container.querySelector('.app__pie-chart__ref__items')).not.toBeInTheDocument()
        })

        it('renders legend items when legends=true', () => {
            renderPieChart({ items: sampleItems, legends: true })
            expect(screen.getByText('Engineering')).toBeInTheDocument()
            expect(screen.getByText('Design')).toBeInTheDocument()
            expect(screen.getByText('Marketing')).toBeInTheDocument()
        })

        it('renders legend values', () => {
            renderPieChart({ items: sampleItems, legends: true })
            expect(screen.getByText('42')).toBeInTheDocument()
            expect(screen.getByText('18')).toBeInTheDocument()
            expect(screen.getByText('12')).toBeInTheDocument()
        })

        it('wraps in Row layout when legends is object without bottom', () => {
            const { container } = renderPieChart({
                items: sampleItems,
                legends: { background: true },
            })
            expect(container.querySelector('.app__pie-chart--ref')).toBeInTheDocument()
        })

        it('renders columns when legends.columns is set', () => {
            const { container } = renderPieChart({
                items: sampleItems,
                legends: { columns: 2 },
            })
            const groups = container.querySelectorAll('.app__pie-chart__ref__items')
            expect(groups).toHaveLength(2)
        })

        it('renders background class by default', () => {
            const { container } = renderPieChart({
                items: sampleItems,
                legends: true,
            })
            expect(container.querySelector('.background')).toBeInTheDocument()
        })

        it('removes background class when legends.background=false', () => {
            const { container } = renderPieChart({
                items: sampleItems,
                legends: { background: false },
            })
            expect(container.querySelector('.background')).not.toBeInTheDocument()
        })

        it('applies classNameWrap to legends container', () => {
            const { container } = renderPieChart({
                items: sampleItems,
                legends: true,
                classNameWrap: 'custom-wrap',
            })
            expect(container.querySelector('.custom-wrap')).toBeInTheDocument()
        })
    })

    describe('data normalization', () => {
        it('maps label to name', () => {
            renderPieChart({ items: sampleItems, legends: true })
            expect(screen.getByText('Engineering')).toBeInTheDocument()
        })

        it('uses id over label when id is present', () => {
            const items = [
                { id: 'eng', label: 'Engineering', value: 42 },
                { label: 'Design', value: 18 },
            ]
            renderPieChart({ items, legends: true })
            expect(screen.getByText('eng')).toBeInTheDocument()
            expect(screen.getByText('Design')).toBeInTheDocument()
        })

        it('assigns colors from palette', () => {
            const { container } = renderPieChart({ items: sampleItems })
            const slices = container.querySelectorAll('path[data-name]')
            slices.forEach((path) => {
                expect(path.getAttribute('data-color')).toMatch(/^#/)
            })
        })

        it('assigns different colors to each item', () => {
            const { container } = renderPieChart({ items: sampleItems })
            const slices = container.querySelectorAll('path[data-name]')
            const colors = Array.from(slices).map((p) => p.getAttribute('data-color'))
            expect(new Set(colors).size).toBe(sampleItems.length)
        })
    })

    describe('sorting', () => {
        it('renders items unsorted by default', () => {
            renderPieChart({ items: sampleItems, legends: true })
            const legendTexts = screen.getAllByText(/Engineering|Design|Marketing/)
            expect(legendTexts[0]).toHaveTextContent('Engineering')
            expect(legendTexts[1]).toHaveTextContent('Design')
            expect(legendTexts[2]).toHaveTextContent('Marketing')
        })

        it('sorts items when sort prop is provided', () => {
            const items = [
                { label: 'C', value: 10 },
                { label: 'A', value: 30 },
                { label: 'B', value: 20 },
            ]
            renderPieChart({ items, legends: true, sort: 'value' })
            const legendTexts = screen.getAllByText(/^[ABC]$/)
            expect(legendTexts[0]).toHaveTextContent('C')
            expect(legendTexts[1]).toHaveTextContent('B')
            expect(legendTexts[2]).toHaveTextContent('A')
        })

        it('supports descending sort with - prefix', () => {
            const items = [
                { label: 'C', value: 10 },
                { label: 'A', value: 30 },
                { label: 'B', value: 20 },
            ]
            renderPieChart({ items, legends: true, sort: '-value' })
            const legendTexts = screen.getAllByText(/^[ABC]$/)
            expect(legendTexts[0]).toHaveTextContent('A')
            expect(legendTexts[1]).toHaveTextContent('B')
            expect(legendTexts[2]).toHaveTextContent('C')
        })
    })
})
