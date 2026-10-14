/**
 * WHAT A COMPONENT'S BRACKET COVERS, AND THAT IT ALWAYS CLOSES (`useBracket`, 2026-10-14).
 * =============================================================================================
 *
 * The bracket opens in a layout effect and closes in a passive effect, so the passive effects of the components
 * below it, where fields register with their form, run while it is open. A Suspense boundary that hides the
 * component and shows it again runs only its layout effects again, on React 18 and 19: a bracket opened then never
 * closed, and the form it paused never validated again. React 16 and 17 run no effect then, and StrictMode runs
 * their effects once, so their legs pass those two cases either way.
 */
import React, { StrictMode, Suspense, useEffect } from 'react'
import { act, render } from '@testing-library/react'
import { useBracket } from '../useBracket'

const MAJOR = Number(React.version.split('.')[0])

/** A bracket that records its opening and closing, and what the component below it did, at which depth. */
function recorded () {
    const record = { log: [], depth: 0 }
    record.bracket = {
        begin: () => { record.depth += 1; record.log.push('begin') },
        end: () => { record.depth -= 1; record.log.push('end') },
    }
    return record
}

function Below ({ record, k }) {
    useEffect(() => { record.log.push(`below ${k} at ${record.depth}`) }, [record, k])
    return null
}

function Bracketed ({ record, bracket, k }) {
    useBracket(bracket, k)
    return <Below record={record} k={k}/>
}

/** What suspends while `pending` holds a promise. */
let pending = null
function Later () {
    if (pending) throw pending.promise
    return null
}

describe('useBracket', () => {
    it('opens before the passive effects below it, and closes after them', () => {
        const record = recorded()
        render(<Bracketed record={record} bracket={record.bracket} k="a"/>)
        expect(record.log).toEqual(['begin', 'below a at 1', 'end'])
    })

    it('opens and closes again when its key changes, and not when it only renders again', () => {
        const record = recorded()
        const { rerender } = render(<Bracketed record={record} bracket={record.bracket} k="a"/>)
        rerender(<Bracketed record={record} bracket={record.bracket} k="a"/>)
        expect(record.log).toEqual(['begin', 'below a at 1', 'end'])

        rerender(<Bracketed record={record} bracket={record.bracket} k="b"/>)
        expect(record.log).toEqual(['begin', 'below a at 1', 'end', 'begin', 'below b at 1', 'end'])
    })

    it('opens nothing when a Suspense boundary hides it and shows it again', async () => {
        const record = recorded()
        const page = () => (
            <Suspense fallback={<p>Loading</p>}>
                <Bracketed record={record} bracket={record.bracket} k="a"/>
                <Later/>
            </Suspense>
        )
        const { container, rerender } = render(page())
        let release
        pending = { promise: new Promise(resolve => { release = resolve }) }
        act(() => { rerender(page()) })
        expect(container.textContent).toBe('Loading')

        pending = null
        // React 16 and 17 retry the boundary from the scheduler, which act does not drive there.
        await act(async () => {
            release()
            await new Promise(resolve => setTimeout(resolve, 50))
        })
        expect(container.textContent).toBe('')
        expect(record.log).toEqual(['begin', 'below a at 1', 'end'])
        expect(record.depth).toBe(0)
    })

    it('opens and closes again for StrictMode\'s second mount, which runs the effects below it again', () => {
        const record = recorded()
        render(<StrictMode><Bracketed record={record} bracket={record.bracket} k="a"/></StrictMode>)
        const once = ['begin', 'below a at 1', 'end']
        expect(record.log).toEqual(MAJOR >= 18 ? [...once, ...once] : once)
    })

    // React 19's `<Activity>` cleans up both kinds of effect of what it hides, and runs both again when it shows it.
    ;(React.Activity ? it : it.skip)('opens and closes again when an <Activity> shows it again', () => {
        const { Activity } = React
        const record = recorded()
        const page = mode => <Activity mode={mode}><Bracketed record={record} bracket={record.bracket} k="a"/></Activity>
        const { rerender } = render(page('visible'))
        rerender(page('hidden'))
        rerender(page('visible'))
        expect(record.log).toEqual(['begin', 'below a at 1', 'end', 'begin', 'below a at 1', 'end'])
    })

    it('does nothing without a bracket', () => {
        const record = recorded()
        render(<Bracketed record={record} bracket={undefined} k="a"/>)
        expect(record.log).toEqual(['below a at 0'])
    })
})
