/**
 * EVERY EXAMPLE RENDERS WITHOUT A WORD ON THE CONSOLE.
 * =============================================================================================
 *
 * Five warnings had accumulated in the corpus, each a real defect that no test reported, because the
 * suites that render the examples replace `console.error` to keep their output readable:
 *  - `buttoned={false}` reaching a `<div>`, from two metas that put a `Tabs` prop on a layout;
 *  - `InputNumber` rejecting the `error={false}` every field is handed before it is touched;
 *  - a nested `Data` document reported as missing `formProps` and `instance`, which it shares;
 *  - OpenL's `@class` tag reaching a `<span>` as an invalid attribute name.
 * This holds the corpus at zero. React prints each kind of warning once per run, so a NEW one shows
 * up here even when another suite has already triggered it elsewhere.
 */
import util from 'util'
import React from 'react'
import { act, cleanup, render } from '@testing-library/react'
import PublishedUIRender from '../../../library/main'
import { EXAMPLES } from '../manifest'
import { clearEngineGlobals } from '../../testing/mountExample'

describe('the example corpus', () => {
    it('renders every example under StrictMode without a console error or warning', async () => {
        const messages = []
        let current = ''
        const record = level => (...args) => {
            messages.push(`${current} ${level}: ${util.format(...args).split('\n')[0]}`)
        }
        const error = jest.spyOn(console, 'error').mockImplementation(record('error'))
        const warn = jest.spyOn(console, 'warn').mockImplementation(record('warn'))
        try {
            for (const example of EXAMPLES) {
                current = example.id
                clearEngineGlobals()
                render(
                    <React.StrictMode>
                        <PublishedUIRender meta={example.meta} data={example.data} initialValues={example.data}
                            onSubmit={() => {}}/>
                    </React.StrictMode>
                )
                await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
                cleanup()
            }
        } finally {
            error.mockRestore()
            warn.mockRestore()
        }

        expect(EXAMPLES.length).toBeGreaterThan(30)
        expect(messages).toEqual([])
    }, 120000)
})
