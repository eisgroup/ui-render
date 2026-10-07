/**
 * The `fetch` action reads the global when it runs. It was read while a document built its actions,
 * so a document rendered where there is no `fetch` (jsdom, an older server) threw a ReferenceError
 * before it rendered anything, and 41 suites here installed a stand-in first, until 2026-10-07.
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../rules'
import { ConfigContext, initialConfigState } from '../../contexts'

describe('the fetch action', () => {
    const original = global.fetch

    afterEach(() => {
        if (original === undefined) delete global.fetch
        else global.fetch = original
    })

    it('lets a document render where there is no fetch, and calls the one there is when it runs', () => {
        delete global.fetch
        const meta = { view: 'Button', children: 'Load', onClick: { name: 'fetch', mapArgs: ['/data.json'] } }
        render(
            <ConfigContext.Provider value={initialConfigState}>
                <UIRender meta={meta} data={{}} />
            </ConfigContext.Provider>
        )
        expect(screen.getByRole('button', { name: 'Load' })).toBeInTheDocument()

        const requested = []
        global.fetch = (url) => {
            requested.push(url)
            return Promise.resolve({ json: () => Promise.resolve({}) })
        }
        fireEvent.click(screen.getByRole('button', { name: 'Load' }))
        expect(requested).toEqual(['/data.json'])
    })
})
