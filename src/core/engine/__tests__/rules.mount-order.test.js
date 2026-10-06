/**
 * WHAT A DOCUMENT HAS IN PLACE BY THE TIME ITS FIRST RENDER IS COMMITTED.
 * =============================================================================================
 *
 * Two things the engine sets up while a document mounts are read before anything else happens:
 *
 *  - A nested document's REGISTRATION with its parent. A field validates when it registers with
 *    the form, which react-final-form does in a mount effect, and a cross-row validator such as
 *    `notWithinRange` then asks for the rows of the document's own scope, `instance.dataKindPath`,
 *    which the registration sets. So the registration must be in place before the fields' mount
 *    effects run: before render, or in the commit, but not in an effect after the fields'.
 *  - The document's `submit`, which the meta's `submit` action is built from when the meta is
 *    built, during the first render.
 *
 * Until §9.3 step 6 both happened in `UNSAFE_componentWillMount`. They are pinned here by
 * behaviour, so they hold for whatever sets them up.
 */
if (typeof global.fetch === 'undefined') {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { act, fireEvent, render, screen } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import '../../modules/form/utils' // eslint-disable-line import/first
import { FIELD } from '../../modules/variables' // eslint-disable-line import/first
import { clearEngineGlobals, mountMeta } from '../../../demo/testing/mountExample' // eslint-disable-line import/first
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts' // eslint-disable-line import/first
import UIRender from '../rules' // eslint-disable-line import/first

const noop = () => {}
const identity = value => value

/** Rows of `dataKind.periods`, each a nested document whose field runs the `recordScope` validator. */
const periodsMeta = {
    view: 'Col',
    items: [{
        view: 'Table',
        name: 'dataKind.periods',
        relativeData: false,
        headers: [{ id: 'startDate', label: 'Start' }],
        renderItemCells: {
            view: 'Data',
            kind: 'periods',
            embedded: true,
            meta: {
                view: 'TableCells',
                items: [{
                    view: 'Input',
                    name: 'startDate',
                    type: 'text',
                    verify: { dataKind: 'periods', validate: [{ name: 'recordScope' }] },
                }],
            },
        },
    }],
}
const periodsData = { dataKind: { periods: [{ startDate: '2020-01-01' }, { startDate: '2020-07-01' }] } }

describe('a document, once its first render is committed', () => {
    it('has its nested documents registered before their fields validate on mount', async () => {
        // A validator reached through `verify`, as `notWithinRange` is, is handed the row's document.
        const scopes = []
        FIELD.VALIDATION.recordScope = (value, options, allValues, meta, instance) => {
            scopes.push(instance.dataKindPath)
            return undefined
        }
        try {
            mountMeta(periodsMeta, periodsData)
            await act(async () => { await Promise.resolve() })

            expect(screen.getByDisplayValue('2020-07-01')).toBeInTheDocument()
            expect(scopes.length).toBeGreaterThanOrEqual(periodsData.dataKind.periods.length)
            // A row that validated before it registered would have had no scope yet.
            for (const scope of scopes) expect(typeof scope).toBe('string')
        } finally {
            delete FIELD.VALIDATION.recordScope
        }
    })

    it('submits through a meta `submit` action from its first render on', () => {
        // No field, so nothing changes the state after the mount and the meta built by the first
        // render is the one clicked.
        const submitted = []
        mountMeta(
            { view: 'Col', items: [{ view: 'Button', label: 'Send', onClick: 'submit' }] },
            { amount: '5' },
            { onSubmit: values => { submitted.push(values) } }
        )

        fireEvent.click(screen.getByText('Send'))

        expect(submitted).toEqual([expect.objectContaining({ amount: '5' })])
    })

    it('needs no lifecycle before its render for it: under StrictMode React reports no componentWillMount', () => {
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            clearEngineGlobals()
            render(
                <React.StrictMode>
                    <ConfigContext.Provider value={initialConfigState}>
                        <AppContext.Provider value={{ ...initialAppState, setPopupState: noop, togglePopupState: noop }}>
                            <UIRender translate={identity} onSubmit={noop} data={periodsData} initialValues={periodsData} meta={periodsMeta} />
                        </AppContext.Provider>
                    </ConfigContext.Provider>
                </React.StrictMode>
            )
            const reported = errors.mock.calls.map(args => args.join(' ')).join('\n')
            expect(screen.getByDisplayValue('2020-01-01')).toBeInTheDocument()
            expect(reported).not.toMatch(/componentWillMount/)
        } finally {
            errors.mockRestore()
        }
    })
})
