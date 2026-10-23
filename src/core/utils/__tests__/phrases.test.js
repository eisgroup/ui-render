import { Active } from '../_envs'
import { alreadyTranslated, BUILT_IN_PHRASES, phrase, PHRASE_NAMESPACE } from '../phrases'

// A host translate that knows only `translations`, and answers any other string as an i18next-based one
// does: with the key it was given, namespace included.
const hostTranslate = translations => value => (value in translations ? translations[value] : value)

// Records what `translate` is asked for, answering with `answer(value)`.
const recording = answer => {
    const calls = []
    const translate = value => {
        calls.push(value)
        return answer(value)
    }
    return { calls, translate }
}

describe('phrase', () => {
    it('shows the host\'s translation of `ui-render:<ID>`', () => {
        expect(phrase(hostTranslate({ 'ui-render:TOTAL': 'Gesamt' }), 'TOTAL')).toBe('Gesamt')
    })

    it('shows the English text when the host answers with the key itself, as an i18next-based host does', () => {
        expect(phrase(hostTranslate({}), 'TOTAL')).toBe('Total')
    })

    it('shows the English text when the host answers with the key without its namespace, as plain i18next does', () => {
        expect(phrase(value => value.slice(value.indexOf(':') + 1), 'TOTAL')).toBe('Total')
    })

    it('shows the English text when the host answers with an empty string', () => {
        expect(phrase(() => '', 'YES')).toBe('Yes')
    })

    it('shows the English text when the host answers with anything but a string', () => {
        [undefined, null, 0, 42, true, {}, ['Gesamt']].forEach(answer => {
            expect(phrase(() => answer, 'NO')).toBe('No')
        })
    })

    it('shows the English text with the identity translator, as a host with no `translate` has', () => {
        expect(phrase(value => value, 'TOTAL')).toBe('Total')
        expect(phrase(Active.translate, 'YES')).toBe('Yes')
    })

    it('counts any other non-empty string as a translation, even one that contains the key', () => {
        expect(phrase(value => `[${value}]`, 'TOTAL')).toBe('[ui-render:TOTAL]')
    })

    it('asks for each id under the `ui-render` namespace, and shows each one\'s English text', () => {
        const { calls, translate } = recording(value => value)
        const ids = Object.keys(BUILT_IN_PHRASES)

        expect(ids.map(id => phrase(translate, id))).toEqual(Object.values(BUILT_IN_PHRASES))
        expect(calls).toEqual(ids.map(id => `${PHRASE_NAMESPACE}:${id}`))
    })

    it('asks once, and never translates what it resolved', () => {
        const found = recording(value => (value === 'ui-render:TOTAL' ? 'Gesamt' : value))
        expect(phrase(found.translate, 'TOTAL')).toBe('Gesamt')
        expect(found.calls).toEqual(['ui-render:TOTAL'])

        const missing = recording(value => value)
        expect(phrase(missing.translate, 'TOTAL')).toBe('Total')
        expect(missing.calls).toEqual(['ui-render:TOTAL'])
    })

    it('fills the placeholders of the host\'s text after the lookup, and does not hand them to it', () => {
        const { calls, translate } = recording(value => (value === 'ui-render:TOTAL' ? 'Gesamt: {count}' : value))

        expect(phrase(translate, 'TOTAL', { count: 3 })).toBe('Gesamt: 3')
        expect(calls).toEqual(['ui-render:TOTAL'])
    })

    it('fills placeholders leniently: a host\'s text may leave out a variable, or name one it is not given', () => {
        expect(phrase(hostTranslate({ 'ui-render:TOTAL': 'Gesamt' }), 'TOTAL', { count: 3 })).toBe('Gesamt')
        expect(phrase(hostTranslate({ 'ui-render:TOTAL': 'Gesamt: {cuont}' }), 'TOTAL', { count: 3 }))
            .toBe('Gesamt: {cuont}')
    })

    it('fills nothing without variables', () => {
        expect(phrase(hostTranslate({ 'ui-render:TOTAL': 'Gesamt: {count}' }), 'TOTAL')).toBe('Gesamt: {count}')
    })
})

describe('alreadyTranslated', () => {
    it('returns what it is given, so a `Text` shows a resolved phrase as it is', () => {
        expect(alreadyTranslated('Gesamt')).toBe('Gesamt')
        expect(alreadyTranslated('ui-render:TOTAL')).toBe('ui-render:TOTAL')
    })
})
