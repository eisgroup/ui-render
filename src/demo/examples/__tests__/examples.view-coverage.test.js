/**
 * EVERY REGISTERED `view` RENDERS WITHOUT A WORD ON THE CONSOLE: AN EXAMPLE RENDERS IT, OR THIS FILE DOES.
 * =============================================================================================
 *
 * `examples.console-clean.test.js` holds every example at zero console errors and warnings, which covers each
 * view an example renders when it first paints. Measured on 2026-10-05, that was 27 of the 37 in `FIELD.TYPE`.
 * Two more were declared only in a tab the `all` example does not open (`Counter`, `Tooltip`), and eight were
 * declared by no example at all. A browser smoke of those found `Upload` throwing for a declaration with
 * neither `formats` nor a known `fileType` (docs/UPGRADE-PLAN.md, Appendix C).
 *
 * This file renders each of the ten from a small declaration, through the published entry and under
 * StrictMode. It holds them to the same zero, and does the one thing each view is for. The first test keeps
 * the list honest: it renders the examples, records the `view` of every node the mapper resolves, and fails
 * when a registered view is rendered by neither an example nor a declaration below.
 */
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import util from 'util' // eslint-disable-line import/first
import React from 'react' // eslint-disable-line import/first
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
import PublishedUIRender from '../../../library/main' // eslint-disable-line import/first
import Render from '../../../core/engine/Render' // eslint-disable-line import/first
import { FIELD } from '../../../core/modules/variables' // eslint-disable-line import/first
import { EXAMPLES } from '../manifest' // eslint-disable-line import/first
import { clearEngineGlobals, noop } from '../../testing/mountExample' // eslint-disable-line import/first

/** Runs `fn` with the mapper's resolver recording the `view` of every node it resolves. */
async function recordingViews (fn) {
    const resolve = Render.Component
    const seen = new Set()
    Render.Component = function RecordingResolver (props) {
        seen.add(props.view)
        return React.createElement(resolve, props)
    }
    try {
        await fn()
    } finally {
        Render.Component = resolve
    }
    return seen
}

const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })

/**
 * Runs the fake clock inside `act`. A view that updates itself on a timer is driven this way: on React 16
 * and 17, an update a real timer fires while `waitFor` polls lands outside `act`, and React warns about it.
 */
const advance = ms => act(async () => { jest.advanceTimersByTime(ms) })

const fruitList = view => ({
    meta: { view, name: 'fruits', renderItem: { view: 'Text', children: { name: 'title' } } },
    data: { fruits: [{ title: 'Apple' }, { title: 'Pear' }] },
    works: () => expect(screen.getAllByText(/^(Apple|Pear)$/).map(node => node.textContent)).toEqual(['Apple', 'Pear']),
})

/** A declaration for each registered view the examples do not render, and what it is for. */
const DECLARATIONS = {
    AutoSubmit: {
        meta: {
            view: 'Col',
            items: [{ view: 'Input', name: 'title', label: 'Title' }, { view: 'AutoSubmit', onChange: 'submit', delay: 0 }],
        },
        data: { title: 'Draft' },
        fakeTimers: true,
        async works ({ submitted }) {
            fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Final' } })
            await advance(10)
            expect(submitted.map(values => values.title)).toEqual(['Final'])
        },
    },
    ColList: fruitList('ColList'),
    Counter: {
        meta: { view: 'Counter', start: 0, end: 42, duration: 50, interval: 10, delay: 0 },
        fakeTimers: true,
        async works ({ container }) {
            expect(container).toHaveTextContent(/^0$/)
            await advance(100)
            expect(container).toHaveTextContent(/^42$/)
        },
    },
    HorizontalList: fruitList('HorizontalList'),
    Image: {
        meta: { view: 'Image', name: 'picture.png' },
        works: ({ container }) => expect(container.querySelector('img').getAttribute('src')).toMatch(/\/picture\.png$/),
    },
    SliderLabel: {
        meta: { view: 'SliderLabel', name: 'amount', label: 'Amount', min: 0, max: 10 },
        data: { amount: 3 },
        works () {
            const slider = screen.getByRole('slider')
            expect(slider).toHaveAttribute('aria-valuenow', '3')
            fireEvent.keyDown(slider, { key: 'ArrowRight' })
            expect(slider).toHaveAttribute('aria-valuenow', '4')
        },
    },
    Toggle: {
        meta: { view: 'Toggle', name: 'enabled', label: 'Enabled' },
        data: { enabled: false },
        works () {
            const toggle = screen.getByRole('checkbox')
            expect(toggle).not.toBeChecked()
            fireEvent.click(toggle)
            expect(toggle).toBeChecked()
        },
    },
    Tooltip: {
        meta: { view: 'Tooltip', label: 'Discards every unsaved change', children: { view: 'Button', children: 'Reset' } },
        works () {
            fireEvent.focus(screen.getByRole('button', { name: 'Reset' }))
            expect(screen.getByRole('tooltip')).toHaveTextContent('Discards every unsaved change')
        },
    },
    Upload: {
        // The declaration that threw: with no `formats` and no `fileType`, the upload accepts any file.
        meta: { view: 'Upload', name: 'attachment', label: 'Attachment' },
        works ({ container }) {
            expect(container.querySelector('input[type="file"]')).not.toHaveAttribute('accept')
            expect(screen.getByText('Upload Attachment File')).toBeInTheDocument()
        },
    },
    VerticalList: fruitList('VerticalList'),
}

describe('the registered views', () => {
    it('leaves none unrendered: an example renders it at first paint, or a declaration below does', async () => {
        const registered = Object.values(FIELD.TYPE)
        const rendered = await recordingViews(async () => {
            for (const example of EXAMPLES) {
                clearEngineGlobals()
                render(<PublishedUIRender meta={example.meta} data={example.data} initialValues={example.data}
                    onSubmit={noop}/>)
                await settle()
                cleanup()
            }
        })

        expect(Object.keys(DECLARATIONS).filter(view => !registered.includes(view))).toEqual([])
        expect(registered.filter(view => !rendered.has(view) && !(view in DECLARATIONS))).toEqual([])
    })
})

describe.each(Object.entries(DECLARATIONS))('view: %s', (view, { meta, data = {}, fakeTimers, works }) => {
    beforeEach(() => { if (fakeTimers) jest.useFakeTimers() })
    afterEach(() => {
        jest.useRealTimers()
        jest.restoreAllMocks()
    })

    it('renders under StrictMode without a word on the console, and works', async () => {
        const messages = []
        const record = level => (...args) => messages.push(`${level}: ${util.format(...args).split('\n')[0]}`)
        jest.spyOn(console, 'error').mockImplementation(record('error'))
        jest.spyOn(console, 'warn').mockImplementation(record('warn'))
        const submitted = []

        const rendered = await recordingViews(async () => {
            clearEngineGlobals()
            const { container } = render(
                <React.StrictMode>
                    <PublishedUIRender meta={meta} data={data} initialValues={data}
                        onSubmit={values => { submitted.push(values) }}/>
                </React.StrictMode>
            )
            await (fakeTimers ? advance(0) : settle())
            await works({ container, submitted })
        })

        expect(rendered.has(view)).toBe(true)
        expect(messages).toEqual([])
    })
})
