/**
 * THE META'S `popup` ACTION: WHAT IT OPENS, AND WITH WHAT.
 * =============================================================================================
 *
 * `popup` opens the alert popup with a title and a content (`docs/SUPPORTED-VIEWS.md`). It has
 * thrown `TypeError: Cannot read properties of undefined (reading 'context')` on every call since
 * 2025-04-17, when the alert moved from a module function onto the instance's context while the
 * action kept handing out the method unbound. The "Button with Icon" example is one of its callers,
 * and its button opened nothing.
 *
 * Binding it is not the whole fix. Its arguments arrive as every action's do: the caller's first,
 * the meta's configured ones appended (`transforms.action-args.test.js`). A `Button`'s caller
 * argument is its click event, which would have become the title, and a React child cannot be an
 * event. In the action chain `config.md` documents, the caller's argument is the previous step's
 * result, and the configured text is its title. So the action drops the caller's event, and of what
 * is left, text comes first as the title unless the first argument is not text: then that one is
 * the content and the text after it is the title.
 *
 * Rendered through the published entry, so the popup itself renders, portal and all.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PublishedUIRender from '../../../library/main'
import buttonIconMeta from '../../../demo/examples/button-icon_meta'
import { clearEngineGlobals } from '../../../demo/testing/mountExample'

const noop = () => {}
const popupBox = () => document.querySelector('.app__popup__box')
const popupTitle = () => document.querySelector('.app__popup__box__header__title')
const popupBody = () => document.querySelector('.app__popup__box__body')

function mount (meta, data = {}) {
    clearEngineGlobals()
    return render(<PublishedUIRender meta={meta} data={data} initialValues={data} onSubmit={noop} />)
}

/** Clicks and collects what React reports, so a handler or render error cannot pass unnoticed. */
function clickReporting (element) {
    const reported = []
    const errors = jest.spyOn(console, 'error').mockImplementation((...args) => { reported.push(args.join(' ')) })
    const uncaught = event => { reported.push(String(event.message)); event.preventDefault() }
    window.addEventListener('error', uncaught)
    try {
        fireEvent.click(element)
    } finally {
        window.removeEventListener('error', uncaught)
        errors.mockRestore()
    }
    return reported
}

describe('the meta\'s `popup` action', () => {
    // One test installs a `fetch` for the action to call; jsdom has none.
    let originalFetch
    beforeEach(() => { originalFetch = global.fetch })
    afterEach(() => {
        if (originalFetch === undefined) delete global.fetch
        else global.fetch = originalFetch
    })

    it('opens the popup from the "Button with Icon" example, which configures nothing to show', () => {
        mount(buttonIconMeta)

        const reported = clickReporting(screen.getByRole('button', { name: 'Open popup' }))

        expect(reported).toEqual([])
        expect(popupBox()).toBeInTheDocument()
        expect(popupTitle()).toHaveTextContent('')
    })

    it('takes a configured text as the title, and a second one as the content', () => {
        mount({ view: 'Button', children: 'Save', onClick: 'popup,Saved,All changes are stored' })

        const reported = clickReporting(screen.getByRole('button', { name: 'Save' }))

        expect(reported).toEqual([])
        expect(popupTitle()).toHaveTextContent('Saved')
        expect(popupBody()).toHaveTextContent('All changes are stored')
    })

    it('shows a chain\'s result as the content, under the text the chain configures', async () => {
        // The shape `src/demo/markdowns/config.md` documents: `fetch`, then `popup` on its result.
        global.fetch = () => Promise.resolve({ city: 'Oslo' })
        mount({
            view: 'Button',
            children: 'Look up',
            onClick: { name: 'fetch', mapArgs: ['/lookup'], onDone: { name: 'popup', args: ['Lookup result'] } },
        })

        const reported = clickReporting(screen.getByRole('button', { name: 'Look up' }))
        await act(async () => { await Promise.resolve() })

        expect(reported).toEqual([])
        expect(popupTitle()).toHaveTextContent('Lookup result')
        expect(popupBody()).toHaveTextContent('Oslo')
    })
})
