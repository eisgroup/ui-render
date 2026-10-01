/**
 * A FILE OF ITS OWN, on purpose: React warns about a missing `key` once per component and module, so
 * in a file that has already rendered `TableColGroup` this test would pass whatever the code does.
 * Each `<col>` used to have no key, and every table declaring `colGroup` logged the warning.
 */
import React from 'react'
import { render } from '@testing-library/react'
import TableColGroup from '../TableColGroup'

it('gives each <col> a key, so React logs nothing', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
        render(
            <table>
                <TableColGroup colGroup={[{ style: { width: '50%' } }, { style: { width: '50%' } }]} />
            </table>
        )

        expect(errors).not.toHaveBeenCalled()
    } finally {
        errors.mockRestore()
    }
})
