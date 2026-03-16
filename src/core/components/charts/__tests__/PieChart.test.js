import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'

// Mock recharts — jsdom has no ResizeObserver / SVG layout
jest.mock('recharts', () => {
    const React = require('react')
    const MockResponsiveContainer = ({ children, height }) => (
        <div data-testid="responsive-container" data-height={height}>{children}</div>
    )
    const MockPieChart = ({ children }) => (
        <div data-testid="piechart">{children}</div>
    )
    const MockPie = ({ data, dataKey, children, label, innerRadius, outerRadius, strokeWidth }) => (
        <div
            data-testid="pie"
            data-datakey={dataKey}
            data-inner-radius={innerRadius}
            data-outer-radius={outerRadius}
            data-stroke-width={strokeWidth}
            data-count={data ? data.length : 0}
        >
            {children}
        </div>
    )
    const MockCell = ({ fill, stroke, color }) => (
        <div data-testid="cell" data-fill={fill} data-stroke={stroke} data-color={color} />
    )
    const MockTooltip = ({ content }) => (
        <div data-testid="tooltip" />
    )
    return {
        ResponsiveContainer: MockResponsiveContainer,
        PieChart: MockPieChart,
        Pie: MockPie,
        Cell: MockCell,
        Tooltip: MockTooltip,
    }
})

// Import after mock
const PieChart = require('../PieChart').default

// Suppress jsdom SVG tag warnings (linearGradient, stop, etc.)
beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}) })
afterAll(() => { console.error.mockRestore() })

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

        it('renders recharts components', () => {
            renderPieChart({ items: sampleItems })
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
            expect(screen.getByTestId('piechart')).toBeInTheDocument()
            expect(screen.getByTestId('pie')).toBeInTheDocument()
        })

        it('renders one Cell per data item', () => {
            renderPieChart({ items: sampleItems })
            const cells = screen.getAllByTestId('cell')
            expect(cells).toHaveLength(sampleItems.length)
        })

        it('passes correct dataKey to Pie', () => {
            renderPieChart({ items: sampleItems })
            expect(screen.getByTestId('pie')).toHaveAttribute('data-datakey', 'value')
        })

        it('passes correct radius props', () => {
            renderPieChart({ items: sampleItems })
            const pie = screen.getByTestId('pie')
            expect(pie).toHaveAttribute('data-inner-radius', '40%')
            expect(pie).toHaveAttribute('data-outer-radius', '60%')
            expect(pie).toHaveAttribute('data-stroke-width', '0')
        })
    })

    describe('height prop', () => {
        it('uses default height of 290', () => {
            renderPieChart({ items: sampleItems })
            expect(screen.getByTestId('responsive-container')).toHaveAttribute('data-height', '290')
        })

        it('respects custom height', () => {
            renderPieChart({ items: sampleItems, height: 400 })
            expect(screen.getByTestId('responsive-container')).toHaveAttribute('data-height', '400')
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

        it('Cell fill uses gradient URL when gradient=true', () => {
            renderPieChart({ items: sampleItems })
            const cells = screen.getAllByTestId('cell')
            expect(cells[0].getAttribute('data-fill')).toMatch(/^url\(#pc-/)
        })

        it('Cell fill uses color directly when gradient=false', () => {
            renderPieChart({ items: sampleItems, gradient: false })
            const cells = screen.getAllByTestId('cell')
            expect(cells[0].getAttribute('data-fill')).toMatch(/^#/)
        })
    })

    describe('legends', () => {
        it('does not render legends by default', () => {
            const { container } = renderPieChart({ items: sampleItems })
            expect(container.querySelector('.app__pie-chart__ref__items')).not.toBeInTheDocument()
        })

        it('renders legend items when legends=true', () => {
            renderPieChart({ items: sampleItems, legends: true })
            // Each item label should appear in legends
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
            renderPieChart({ items: sampleItems })
            const cells = screen.getAllByTestId('cell')
            // Each cell should have a color from the palette
            cells.forEach(cell => {
                expect(cell.getAttribute('data-color')).toMatch(/^#/)
            })
        })

        it('assigns different colors to each item', () => {
            renderPieChart({ items: sampleItems })
            const cells = screen.getAllByTestId('cell')
            const colors = cells.map(c => c.getAttribute('data-color'))
            const unique = new Set(colors)
            expect(unique.size).toBe(sampleItems.length)
        })
    })

    describe('sorting', () => {
        it('renders items unsorted by default', () => {
            renderPieChart({ items: sampleItems, legends: true })
            // With legends, items appear as reference items — check order is preserved
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
