import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TableColGroup from '../TableColGroup'

describe('TableColGroup', () => {
    it('renders a <colgroup> with one <col> per column', () => {
        const { container } = render(
            <table>
                <TableColGroup colGroup={[{ style: { width: '50%' } }, { style: { width: '50%' } }]} />
            </table>
        )
        const colgroup = container.querySelector('colgroup')
        expect(colgroup).toBeInTheDocument()
        expect(colgroup.querySelectorAll('col').length).toBe(2)
    })

    it('applies the style prop to each <col>', () => {
        const { container } = render(
            <table>
                <TableColGroup colGroup={[{ style: { width: '100px' } }]} />
            </table>
        )
        expect(container.querySelector('col').style.width).toBe('100px')
    })
})
