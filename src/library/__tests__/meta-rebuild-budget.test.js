/**
 * WHEN A PICK BUILDS THE DOCUMENT'S META ANEW, pinned (2026-10-12).
 * =============================================================================================
 *
 * A named Select with no `onChange` of its own writes its value into the document's state
 * (`toOpenLConfig` gives it `setState,<name>`), and a document built its whole meta anew for every new
 * state. So every pick rendered every Select of the document, and every field that takes an object or a
 * function as a prop. The meta is now kept while the state holds what the build read from it
 * (`engine/metaStateReads.ts`). A pick that a `{state.x}` template reads still builds it anew, and the
 * fields that depend on it follow; a pick nothing reads builds nothing.
 *
 * On the `selectCascading` example, whose product list reads `{state.categoryX,0}`: picking a product
 * built the meta and rendered both Selects; it builds nothing and renders the product Select alone since.
 * Picking a category still builds it, and the product list follows.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import UIRender from '../main'
import meta from '../../demo/examples/select-cascading-meta.json'
import data from '../../demo/examples/select-cascading-data.json'

/** How often the document's meta is built: once for each call into `metaToProps` from `rules.tsx`. */
const mockSeen = { builds: 0, renders: {}, options: {} }
jest.mock('../../core/engine/transforms', () => {
    const actual = jest.requireActual('../../core/engine/transforms')
    return {
        __esModule: true,
        ...actual,
        metaToProps: (...args) => {
            mockSeen.builds += 1
            return actual.metaToProps(...args)
        },
    }
})
/** Every render of each Select's `Dropdown`, by name, and the options it was last handed. */
jest.mock('../../core/components/Dropdown', () => {
    const React = require('react')
    const actual = jest.requireActual('../../core/components/Dropdown')
    const Dropdown = props => {
        mockSeen.renders[props.name] = (mockSeen.renders[props.name] || 0) + 1
        mockSeen.options[props.name] = props.options
        return React.createElement(actual.Dropdown, props)
    }
    return { __esModule: true, ...actual, Dropdown }
})

const settle = () => act(() => { jest.runOnlyPendingTimers() })

/** Picks an option of a Select by its text, as a user does, and returns what that cost. */
function pick (selectName, text) {
    act(() => { fireEvent.click(screen.getByRole('combobox', { name: `Select ${selectName}` })) })
    settle()
    const option = screen.getAllByRole('option').find(element => element.textContent === text)
    mockSeen.builds = 0
    mockSeen.renders = {}
    act(() => { fireEvent.click(option) })
    settle()
    return { builds: mockSeen.builds, renders: { ...mockSeen.renders } }
}

const productsOffered = () => (mockSeen.options.productX || []).map(option => option.text)

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('picks in the cascading Selects', () => {
    it('build the meta only when a template reads the pick, and the dependent list follows', () => {
        render(<UIRender meta={meta} data={data} initialValues={data} />)
        settle()
        expect(productsOffered()).toEqual(['Alpha', 'Beta', 'Gamma'])

        // Nothing reads `productX`. Before 2026-10-12 this built the meta and rendered both Selects.
        const product = pick('productX', 'Beta')
        // `{state.categoryX,0}` reads the category.
        const category = pick('categoryX', 'Category 2')

        expect({ product, category: category.builds }).toEqual({ product: { builds: 0, renders: { productX: 1 } }, category: 1 })
        expect(productsOffered()).toEqual(['Delta'])
    })
})
