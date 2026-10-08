/**
 * A NEW PROP SHOWS IN THE COMMIT THAT BRINGS IT.
 * =============================================================================================
 *
 * Three components copied a prop into state through an effect until 2026-10-08, when the React
 * Compiler's lint rules came on: `Dropdown` its options, `InputNumber` the value its parent holds,
 * and the pie chart the slice its open tooltip shows. An effect runs after the commit, so the
 * commit that brought the new prop still showed the old one, and a second commit, of that
 * component alone, put the new one on the screen. They derive it during the render now.
 *
 * `CommitProbe` renders after the component, under the same parent, and reads the DOM in a layout
 * effect, so it reports what each commit of that parent put on the screen. It does not render in
 * the component's own second commit, which is the point: on the old code the commit that delivered
 * the new prop read the old value, and these tests failed.
 */
import React, { useLayoutEffect } from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { Dropdown } from '../Dropdown'
import InputNumber from '../InputNumber'
import PieChart from '../charts/PieChart'

function CommitProbe ({ onCommit }) {
    useLayoutEffect(() => {
        onCommit()
    })
    return null
}

/** Renders `element` with a probe after it, and returns what `read` saw at each commit. */
function renderProbed (element, read) {
    const seen = []
    const onCommit = () => seen.push(read())
    const tree = node => (
        <ConfigContext.Provider value={initialConfigState}>
            {node}
            <CommitProbe onCommit={onCommit}/>
        </ConfigContext.Provider>
    )
    const utils = render(tree(element))
    return { ...utils, seen, rerenderWith: node => utils.rerender(tree(node)) }
}

describe('the commit that brings a new prop shows it', () => {
    it('Dropdown: new options', () => {
        const shown = () => document.querySelector('.text').textContent.trim()
        const { seen, rerenderWith } = renderProbed(
            <Dropdown name="region" value="a" options={[{ text: 'Old A', value: 'a' }]}/>,
            shown,
        )

        rerenderWith(<Dropdown name="region" value="a" options={[{ text: 'New A', value: 'a' }]}/>)

        expect(seen).toEqual(['Old A', 'New A'])
    })

    it('InputNumber: a new value from its parent', () => {
        const shown = () => document.querySelector('input').value
        const { seen, rerenderWith } = renderProbed(<InputNumber name="amount" value={1}/>, shown)

        rerenderWith(<InputNumber name="amount" value={2}/>)

        expect(seen).toEqual(['1', '2'])
    })

    it('PieChart: new data in an open tooltip', () => {
        const tooltip = () => {
            const node = document.querySelector('.app__chart__tooltip')
            return node ? node.textContent : null
        }
        const { container, seen, rerenderWith } = renderProbed(
            <PieChart items={[{ label: 'Account', value: 1 }]}/>,
            tooltip,
        )
        // React builds `onMouseEnter` from `mouseover`; the offsets are where the tooltip goes.
        const hover = new MouseEvent('mouseover', { bubbles: true })
        Object.defineProperties(hover, { offsetX: { value: 4 }, offsetY: { value: 6 } })
        fireEvent(container.querySelector('path[data-name]'), hover)
        expect(tooltip()).toContain('Account1')

        rerenderWith(<PieChart items={[{ label: 'Account', value: 5 }]}/>)

        expect(seen).toHaveLength(2)
        expect(seen[0]).toBeNull()
        expect(seen[1]).toContain('Account5')
    })
})
