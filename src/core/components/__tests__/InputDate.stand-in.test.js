/**
 * A DATE FIELD RENDERS WHAT rc-picker RENDERS UNTIL IT IS NEEDED (2026-10-14).
 * =============================================================================================
 *
 * rc-picker cost a closed field about as much as the rest of a 200-row period table did. So a field renders a stand-in
 * for it, the element rc-picker renders for a closed field, until the field comes near the viewport, or takes the
 * focus, or is pressed. Where there is no IntersectionObserver, the picker mounts before the first paint, so jsdom and
 * a host's tests see rc-picker as they did.
 *
 * Here a fake observer reports nothing by itself, so the stand-in stays until a test says the field came near.
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import moment from 'moment'
import InputDate from '../InputDate'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

/** The one observer InputDate makes, and the elements it watches. */
let watched = null
class FakeObserver {
    constructor (callback) {
        this.callback = callback
        this.elements = new Set()
        watched = this
    }

    observe (element) { this.elements.add(element) }

    unobserve (element) { this.elements.delete(element) }

    disconnect () { this.elements.clear() }

    /** Tells the observer that every element it watches came near, or, with `false`, that it is still far. */
    near (isIntersecting = true) {
        act(() => { this.callback([...this.elements].map(target => ({ target, isIntersecting }))) })
    }
}

const withObserver = () => { global.IntersectionObserver = FakeObserver }
const withoutObserver = () => { delete global.IntersectionObserver }
afterEach(withoutObserver)

const field = (props, config = initialConfigState) => (
    <ConfigContext.Provider value={config}>
        <InputDate onChange={() => {}} {...props}/>
    </ConfigContext.Provider>
)

/** The container's markup with each element's attributes sorted, as the examples' DOM contract compares it. */
function markupOf (container) {
    const copy = container.cloneNode(true)
    for (const element of copy.querySelectorAll('*')) {
        const attributes = [...element.attributes].map(({ name, value }) => [name, value]).sort(([a], [b]) => (a < b ? -1 : 1))
        for (const [name] of attributes) element.removeAttribute(name)
        for (const [name, value] of attributes) element.setAttribute(name, value)
    }
    return copy.innerHTML
}

const CASES = {
    'no value': {},
    'a value': { value: '2024-03-15' },
    'a placeholder': { placeholder: 'Pick a day', value: '' },
    'disabled': { disabled: true, value: '2024-03-15' },
    'read-only': { readonly: true, value: '2024-03-15' },
    'an error, which the input names': { error: 'Required', value: '' },
    'a name and a label': { name: 'start', label: 'Start', value: '2024-03-15' },
    'a title, which rc-picker drops': { title: 'When', value: '2024-03-15' },
    'aria, data, role, tab index and required': { 'aria-label': 'Start Date', 'data-row': '3', role: 'textbox', tabIndex: 2, required: true },
    'its own autocomplete': { autoComplete: 'bday', value: '2024-03-15' },
    'a Date value': { value: new Date(2024, 2, 15) },
}

describe('a date field before its picker mounts', () => {
    it.each(Object.entries(CASES))('renders what rc-picker renders for a closed field, with %s', (_, props) => {
        withObserver()
        const standIn = render(field(props))
        expect(watched.elements.size).toBe(1)
        const before = markupOf(standIn.container)
        standIn.unmount()

        withoutObserver()
        const picker = render(field(props))
        expect(markupOf(picker.container)).toBe(before)
    })

    it('renders a month name as rc-picker does, in its own locale, whatever moment\'s global one is', () => {
        const config = { ...initialConfigState, dateFormat: 'DD MMM YYYY' }
        const previous = moment.locale()
        moment.locale('fr')
        try {
            withObserver()
            const standIn = render(field({ value: '2024-03-15' }, config))
            const before = markupOf(standIn.container)
            standIn.unmount()

            withoutObserver()
            const picker = render(field({ value: '2024-03-15' }, config))
            expect(markupOf(picker.container)).toBe(before)
            expect(screen.getByDisplayValue('15 Mar 2024')).toBeTruthy()
        } finally {
            moment.locale(previous)
        }
    })

    it('mounts the picker when the field comes near the viewport, and stops watching it', () => {
        withObserver()
        const { container } = render(field({ value: '2024-03-15' }))
        const standIn = container.querySelector('input')
        watched.near()
        expect(watched.elements.size).toBe(0)
        expect(standIn.isConnected).toBe(false)
        expect(container.querySelector('input').value).toBe('03-15-2024')
        // Nothing took the focus.
        expect(document.activeElement).toBe(document.body)
    })

    it('keeps the stand-in while the field is still far from the viewport', () => {
        withObserver()
        const { container } = render(field({ value: '2024-03-15' }))
        const standIn = container.querySelector('input')
        watched.near(false)
        expect(standIn.isConnected).toBe(true)
        expect(watched.elements.size).toBe(1)
    })

    it('ignores a report for a field that has stopped waiting', () => {
        withObserver()
        const { container, unmount } = render(field({ value: '2024-03-15' }))
        const element = container.querySelector('.ui-render-picker')
        unmount()
        act(() => { watched.callback([{ target: element, isIntersecting: true }]) })
        expect(watched.elements.size).toBe(0)
    })

    it('mounts the picker as a pointer comes over the field, before it is pressed', () => {
        withObserver()
        const { container } = render(field({ value: '2024-03-15' }))
        const standIn = container.querySelector('input')
        fireEvent.pointerEnter(container.querySelector('.ui-render-picker'))
        expect(standIn.isConnected).toBe(false)
        // Mounted as it is near the viewport: closed, and not focused.
        expect(document.activeElement).toBe(document.body)
        expect(document.querySelector('.ui-render-picker-dropdown')).toBeNull()
    })

    it('mounts the picker on a focus, and hands it the focus, which the field hears', () => {
        withObserver()
        const heard = []
        const { container } = render(field({ value: '2024-03-15', onFocus: () => heard.push('focus') }))
        act(() => { container.querySelector('input').focus() })
        const input = container.querySelector('input')
        expect(document.activeElement).toBe(input)
        expect(heard).toEqual(['focus'])
        expect(document.querySelector('.ui-render-picker-dropdown')).toBeNull()
    })

    it('mounts the picker open and focused on a press no pointer came over before', () => {
        withObserver()
        const { container } = render(field({ value: '2024-03-15' }))
        fireEvent.pointerDown(container.querySelector('.ui-render-picker'))
        expect(document.activeElement).toBe(container.querySelector('input'))
        expect(document.querySelector('.ui-render-picker-dropdown')).not.toBeNull()
    })

    it('changes nothing on a change that reaches the stand-in, which only a script can send before a focus', () => {
        withObserver()
        const changes = []
        const { container } = render(field({ value: '2024-03-15', onChange: value => changes.push(value) }))
        const standIn = container.querySelector('input')
        fireEvent.change(standIn, { target: { value: '04-01-2024' } })
        expect(standIn.value).toBe('03-15-2024')
        expect(standIn.isConnected).toBe(true)
        expect(changes).toEqual([])
    })

    it('stops waiting when the field goes before it came near', () => {
        withObserver()
        const { unmount } = render(field({ value: '2024-03-15' }))
        expect(watched.elements.size).toBe(1)
        unmount()
        expect(watched.elements.size).toBe(0)
    })
})
