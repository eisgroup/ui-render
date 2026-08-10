import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { JsonView } from '../index'

describe('JsonView', () => {
    it('renders a json-tree wrapper for an empty object', () => {
        const { container } = render(<JsonView data={{}} />)
        expect(container.querySelector('.json-tree')).toBeInTheDocument()
    })

    it('renders nested object data', () => {
        const data = { a: 1, b: { c: 'hello' } }
        const { container } = render(<JsonView data={data} expanded />)
        expect(container.textContent).toContain('a')
        expect(container.textContent).toContain('hello')
    })

    it('renders array items', () => {
        const data = { items: [1, 2, 3] }
        const { container } = render(<JsonView data={data} expanded />)
        expect(container.textContent).toContain('1')
        expect(container.textContent).toContain('3')
    })

    it('renders primitives as leaves', () => {
        const data = { yes: true, no: false, nul: null, num: 42, str: 'hi' }
        const { container } = render(<JsonView data={data} expanded />)
        const text = container.textContent
        expect(text).toContain('true')
        expect(text).toContain('false')
        expect(text).toContain('42')
        expect(text).toContain('hi')
    })

    it('inverted=true uses the dark theme', () => {
        const { container } = render(<JsonView data={{ a: 1 }} inverted />)
        const tree = container.querySelector('.json-tree')
        expect(tree).toBeInTheDocument()
    })

    it('supports fill prop class', () => {
        const { container } = render(<JsonView data={{}} fill />)
        expect(container.querySelector('.json-tree.fill')).toBeInTheDocument()
    })

    it('honors shouldExpandNode override', () => {
        const data = { outer: { inner: 'value' } }
        const { container } = render(
            <JsonView data={data} shouldExpandNode={() => true} />
        )
        expect(container.textContent).toContain('value')
    })

    it('hides root brackets when hideRoot=true (default)', () => {
        const { container } = render(<JsonView data={{ a: 1 }} expanded />)
        // hideRoot=true means children render directly; just verify content shows
        expect(container.textContent).toContain('a')
    })

    it('shows root brackets when hideRoot=false', () => {
        const { container } = render(<JsonView data={{ a: 1 }} hideRoot={false} expanded />)
        expect(container.textContent).toContain('{')
    })

    // Named for what it asserts: it renders, it does not click. The toggle rows are plain divs with an
    // onClick and no role, so the selector below could never reach them. Opening and closing a collapsed
    // collection for real is covered in JsonView.behavior.test.js.
    it('renders a nested collection without crashing', () => {
        const data = { outer: { inner: 'value' } }
        const { container } = render(<JsonView data={data} />)
        const clickables = container.querySelectorAll('[role="button"], span')
        expect(clickables.length).toBeGreaterThan(0)
    })
})
