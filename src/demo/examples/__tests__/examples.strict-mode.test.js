/**
 * THE CORPUS UNDER StrictMode: §9.3 STEP 7'S ACCEPTANCE.
 * =============================================================================================
 *
 * §7 defines "StrictMode-clean": the demo runs under `<StrictMode>` with no lifecycle warning, no
 * duplicated form subscription, no state update during render, every timer and listener cleaned
 * up on unmount, and two instances on one page fully isolated, with no difference in behaviour.
 * This pins each of those on the examples the demo shows, through the published entry:
 *  - every example renders the same DOM with and without StrictMode, after its mount and after an
 *    edit, and reports nothing under StrictMode that it does not report without it;
 *  - a document with forms keeps as many live form subscriptions and field registrations under
 *    StrictMode as without, and none, and no listener, once it unmounts;
 *  - two documents on one page keep their own translator and their own submit;
 *  - a document StrictMode has unmounted and mounted again is not left marked as unmounting.
 *
 * Found by building this, and fixed with it: a dropdown lost its default selection (its value sync
 * skipped the first run through a mount flag), the form wrapper lost its subscription until the
 * next render, and the form layer stayed marked as unmounting.
 */
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}

/** Live `form.subscribe` and `form.registerField` calls on every form, across all of them. */
const live = { subscriptions: 0, fields: 0 }
jest.mock('final-form', () => {
    const actual = jest.requireActual('final-form')
    const counted = (target, key, method) => (...args) => {
        target[key] += 1
        const release = method(...args)
        let released = false
        return () => {
            if (!released) {
                released = true
                target[key] -= 1
            }
            return release()
        }
    }
    return {
        ...actual,
        createForm: (...args) => {
            const form = actual.createForm(...args)
            form.subscribe = counted(live, 'subscriptions', form.subscribe)
            form.registerField = counted(live, 'fields', form.registerField)
            return form
        },
    }
})
/* eslint-disable import/first */
import React from 'react'
import { act, fireEvent, render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import PublishedUIRender from '../../../library/main'
import { EXAMPLES } from '../manifest'
import { clearEngineGlobals } from '../../testing/mountExample'
import { Render } from '../../../core/engine'
/* eslint-enable import/first */

const flush = (ms = 0) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)) })
// Long enough for the debounced input sync and the date picker's blur to settle: compared before
// either has, an edit shows a transient state that differs between runs for reasons of timing only.
const SETTLE_AFTER_EDIT = 400

/**
 * VIRTUAL TIME FOR THE TWO RUNS BEING COMPARED. On real time a read lands wherever the machine's speed
 * puts it, and a slow CI runner put one: `ProgressBar` fills its bar 200 ms after it mounts, and on
 * React 16 under StrictMode the `all` example took longer than that to mount and settle, so the strict
 * run read `width: 100%` against the plain run's `width: 0%` (CI run 36870778501). Measured across the
 * corpus, that fill is the one thing still changing after the read; nothing else moves after it.
 *
 * Only the timers are faked, so the two runs read the DOM at the same moment of their own clock, as
 * slow as the machine may be. `Date`, the microtask queues, `setImmediate` and the animation frames
 * stay real: nothing in the corpus needs them faked, and React's act and its scheduler use them.
 * `advanceTimersByTimeAsync` lets promises settle between timers, as real time does.
 */
const VIRTUAL_TIMERS = {
    doNotFake: [
        'Date', 'hrtime', 'performance', 'nextTick', 'queueMicrotask', 'setImmediate', 'clearImmediate',
        'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback',
    ],
}
const advance = (ms = 0) => act(async () => { await jest.advanceTimersByTimeAsync(ms) })
const strip = message => message.split('\n')[0]

/** One example, mounted, edited and unmounted, with what it reported and what it left. */
async function exercise (example, { strict }) {
    clearEngineGlobals()
    live.subscriptions = 0
    live.fields = 0
    const reported = []
    const errors = jest.spyOn(console, 'error').mockImplementation((...args) => { reported.push(strip(args.join(' '))) })
    const warnings = jest.spyOn(console, 'warn').mockImplementation((...args) => { reported.push(strip(args.join(' '))) })
    const Wrapper = strict ? React.StrictMode : React.Fragment
    const result = {}
    jest.useFakeTimers(VIRTUAL_TIMERS)
    try {
        const view = render(
            <Wrapper>
                <PublishedUIRender meta={example.meta} data={example.data} initialValues={example.data} onSubmit={() => {}} />
            </Wrapper>
        )
        await advance()
        result.mounted = document.body.innerHTML
        result.liveMounted = { ...live }
        const box = screen.queryAllByRole('textbox')[0]
        if (box) {
            fireEvent.focus(box)
            fireEvent.change(box, { target: { value: 'an edit' } })
            fireEvent.blur(box)
            await advance(SETTLE_AFTER_EDIT)
        }
        result.edited = document.body.innerHTML
        view.unmount()
        await advance()
        result.liveUnmounted = { ...live }
    } finally {
        errors.mockRestore()
        warnings.mockRestore()
        cleanup()
        jest.useRealTimers()
    }
    result.reported = reported
    return result
}

describe('every example under StrictMode', () => {
    it.each(EXAMPLES.map(example => [example.id, example]))('%s renders, and reports, what it does without it', async (_id, example) => {
        const plain = await exercise(example, { strict: false })
        const strict = await exercise(example, { strict: true })

        expect(strict.mounted).toBe(plain.mounted)
        expect(strict.edited).toBe(plain.edited)
        expect(strict.reported.filter(message => !plain.reported.includes(message))).toEqual([])
        expect(strict.liveMounted).toEqual(plain.liveMounted)
        expect(strict.liveUnmounted).toEqual({ subscriptions: 0, fields: 0 })
    })
})

describe('a document under StrictMode', () => {
    it('leaves no document or window listener once it unmounts', async () => {
        const example = EXAMPLES.find(({ id }) => id === 'nestedDataKind')
        await exercise(example, { strict: false }) // React adds its own document listeners on first use
        let listeners = 0
        const targets = [window, document]
        const originals = targets.map(target => [target.addEventListener, target.removeEventListener])
        targets.forEach(target => {
            const add = target.addEventListener
            const remove = target.removeEventListener
            target.addEventListener = function (...args) { listeners += 1; return add.apply(this, args) }
            target.removeEventListener = function (...args) { listeners -= 1; return remove.apply(this, args) }
        })
        try {
            await exercise(example, { strict: true })
        } finally {
            targets.forEach((target, i) => { [target.addEventListener, target.removeEventListener] = originals[i] })
        }

        expect(listeners).toBe(0)
    })

    it('is not left marked as unmounting by the remount StrictMode makes', async () => {
        const seen = []
        const resolve = Render.Component
        Render.Component = function RecordingResolver (props) {
            if (props.instance && !seen.includes(props.instance)) seen.push(props.instance)
            return React.createElement(resolve, props)
        }
        try {
            clearEngineGlobals()
            const values = { name: 'Ada' }
            render(
                <React.StrictMode>
                    <PublishedUIRender meta={{ view: 'Input', name: 'name', label: 'Name' }} data={values} initialValues={values} onSubmit={() => {}} />
                </React.StrictMode>
            )
            await flush()
            const mounted = seen.filter(instance => !instance.props.parent)

            expect(mounted.length).toBeGreaterThan(0)
            for (const instance of mounted) expect(instance.isUnmounting).toBeFalsy()
        } finally {
            Render.Component = resolve
            cleanup()
        }
    })
})

describe('two documents on one page under StrictMode', () => {
    const meta = { view: 'Col', items: [{ view: 'Text', label: 'hello' }, { view: 'Button', children: 'Send', onClick: 'submit' }] }
    const page = (submitted, extra = {}) => (
        <React.StrictMode>
            <div data-testid="first">
                <PublishedUIRender meta={meta} data={{ from: 'A' }} initialValues={{ from: 'A' }} translate={value => `A:${value}`} onSubmit={values => submitted.push(values)} {...extra} />
            </div>
            <div data-testid="second">
                <PublishedUIRender meta={meta} data={{ from: 'B' }} initialValues={{ from: 'B' }} translate={value => `B:${value}`} onSubmit={values => submitted.push(values)} />
            </div>
        </React.StrictMode>
    )

    it('keep their own translator, after one of them renders again, and their own submit', async () => {
        clearEngineGlobals()
        const submitted = []
        const view = render(page(submitted))
        view.rerender(page(submitted, { className: 'again' }))

        expect(screen.getByTestId('first')).toHaveTextContent('A:hello')
        expect(screen.getByTestId('second')).toHaveTextContent('B:hello')

        fireEvent.click(screen.getByTestId('second').querySelector('button'))
        await flush()
        fireEvent.click(screen.getByTestId('first').querySelector('button'))
        await flush()

        expect(submitted.map(values => values.from)).toEqual(['B', 'A'])
        cleanup()
    })
})
