import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { View } from '../View'
import { Row, RowRef } from '../Row'
import { Loading } from '../Loading'
import { Spinner } from '../Spinner'
import { Icon } from '../Icon'
import { Label } from '../Label'
import TextDateValue from '../TextDateValue'
import { ColorSwatch } from '../ColorSwatch'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

function withConfig (ui) {
    return <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
}

describe('View', () => {
    it('renders a <div> with flex--col class', () => {
        const { container } = render(<View />)
        expect(container.querySelector('div')).toHaveClass('flex--col')
    })
    it('adds modifier classes for boolean props', () => {
        const { container } = render(<View fill reverse rtl />)
        const cls = container.querySelector('div').className
        expect(cls).toContain('fill')
        expect(cls).toContain('reverse')
        expect(cls).toContain('rtl')
    })
    it('adds pointer class when onClick is supplied', () => {
        const { container } = render(<View onClick={() => {}} />)
        expect(container.querySelector('div').className).toContain('pointer')
    })
})

describe('Row', () => {
    it('renders a <div> with flex--row class', () => {
        const { container } = render(<Row />)
        expect(container.querySelector('div')).toHaveClass('flex--row')
    })
    it('RowRef forwards ref', () => {
        let captured = null
        render(<RowRef ref={(el) => { captured = el }} />)
        expect(captured).not.toBeNull()
    })
})

describe('Loading', () => {
    it('renders nothing when loading is false', () => {
        const { container } = render(<Loading loading={false} />)
        expect(container.firstChild).toBeNull()
    })
    it('renders spinner when loading', () => {
        const { container } = render(<Loading loading />)
        expect(container.querySelector('.app__loading')).toBeInTheDocument()
    })
    it('adds transparent class', () => {
        const { container } = render(<Loading loading transparent />)
        expect(container.querySelector('.app__loading').className).toContain('transparent')
    })
    it('renders children text', () => {
        const { container } = render(withConfig(<Loading loading>Wait...</Loading>))
        expect(container.textContent).toContain('Wait...')
    })
    it('uses default loading=true when not passed', () => {
        const { container } = render(<Loading />)
        expect(container.querySelector('.app__loading')).toBeInTheDocument()
    })
})

describe('Spinner', () => {
    it('renders a div with size and color classes', () => {
        const { container } = render(<Spinner size="large" color="primary" />)
        const cls = container.querySelector('div').className
        expect(cls).toContain('app__spinner')
        expect(cls).toContain('large')
        expect(cls).toContain('primary')
    })
    it('falls back to default size/color when not passed', () => {
        const { container } = render(<Spinner />)
        const cls = container.querySelector('div').className
        expect(cls).toContain('base')
        expect(cls).toContain('primary')
    })
})

describe('Icon', () => {
    it('renders an <i> with name prefixed class', () => {
        const { container } = render(<Icon name="user" />)
        const i = container.querySelector('i')
        expect(i).toBeInTheDocument()
        expect(i.className).toContain('icon-user')
    })
    it('adds pointer when onClick is given', () => {
        const { container } = render(<Icon name="x" onClick={() => {}} />)
        expect(container.querySelector('i').className).toContain('pointer')
    })
    it('adds large/small modifier classes', () => {
        const { container } = render(<Icon name="x" large />)
        expect(container.querySelector('i').className).toContain('large')
    })
})

describe('Label', () => {
    it('renders a <label> with children', () => {
        const { container } = render(<Label>caption</Label>)
        expect(container.querySelector('label')).toHaveTextContent('caption')
    })
    it('applies translate fn to string children', () => {
        const upper = (s) => s.toUpperCase()
        const { container } = render(<Label translate={upper}>hello</Label>)
        expect(container.querySelector('label')).toHaveTextContent('HELLO')
    })
})

describe('TextDateValue', () => {
    it('renders the value', () => {
        const { container } = render(withConfig(<TextDateValue value="2024-01-15" />))
        expect(container.textContent.length).toBeGreaterThan(0)
    })
    it('uses context dateFormat over prop default', () => {
        const config = { ...initialConfigState, dateFormat: 'YYYY-MM-DD' }
        const { container } = render(
            <ConfigContext.Provider value={config}>
                <TextDateValue value="2024-01-15" />
            </ConfigContext.Provider>
        )
        expect(container.textContent).toContain('2024-01-15')
    })
    it('falls back when context dateFormat is missing', () => {
        const config = { ...initialConfigState, dateFormat: undefined }
        const { container } = render(
            <ConfigContext.Provider value={config}>
                <TextDateValue value="2024-01-15" />
            </ConfigContext.Provider>
        )
        // Default fallback inside TextDateValue is DD/MM/YYYY
        expect(container.textContent).toContain('15/01/2024')
    })
})

describe('ColorSwatch', () => {
    it('renders an element with the colour applied', () => {
        const { container } = render(withConfig(<ColorSwatch value="255,0,0" />))
        const span = container.querySelector('.color__swatch')
        expect(span).toBeInTheDocument()
        expect(span.style.backgroundColor).toMatch(/rgb\(255, 0, 0\)/)
    })
    it('adds white class for white rgb', () => {
        const { container } = render(withConfig(<ColorSwatch value="255,255,255" />))
        expect(container.querySelector('.color__swatch').className).toContain('white')
    })
    it('adds black class for black rgb', () => {
        const { container } = render(withConfig(<ColorSwatch value="0,0,0" />))
        expect(container.querySelector('.color__swatch').className).toContain('black')
    })
    it('omits backgroundColor when value is empty', () => {
        const { container } = render(withConfig(<ColorSwatch value="" />))
        const span = container.querySelector('.color__swatch')
        expect(span.style.backgroundColor).toBe('')
    })
    it('respects small/large modifiers', () => {
        const { container, rerender } = render(withConfig(<ColorSwatch value="255,0,0" small />))
        expect(container.querySelector('.color__swatch').className).toContain('small')
        rerender(withConfig(<ColorSwatch value="255,0,0" large />))
        expect(container.querySelector('.color__swatch').className).toContain('large')
    })
})
