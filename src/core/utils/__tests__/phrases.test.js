import { Active } from '../_envs'
import {
    alreadyTranslated, BUILT_IN_PHRASES, isPhraseMessage, phrase, PHRASE_NAMESPACE, phraseMessage, phraseParts,
} from '../phrases'

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

describe('phraseMessage', () => {
    it('names a built-in phrase and the variables its placeholders take', () => {
        expect(phraseMessage('REQUIRED')).toEqual({ phrase: 'REQUIRED' })
        expect(phraseMessage('MUST_BE_MINIMUM', { min: 0 })).toEqual({ phrase: 'MUST_BE_MINIMUM', variables: { min: 0 } })
    })

    it('cannot be changed, its variables included, since a validator hands the same one out each time', () => {
        const variables = { min: 3 }
        const message = phraseMessage('MUST_BE_MINIMUM', variables)
        variables.min = 4

        expect(message.variables).toEqual({ min: 3 })
        expect(Object.isFrozen(message)).toBe(true)
        expect(Object.isFrozen(message.variables)).toBe(true)
    })
})

describe('isPhraseMessage', () => {
    it('is true of a message, and of any object whose `phrase` is the id of a built-in phrase', () => {
        expect(isPhraseMessage(phraseMessage('OK'))).toBe(true)
        expect(isPhraseMessage({ phrase: 'TOTAL', variables: { count: 1 } })).toBe(true)
    })

    it('is false of anything else, a string with an id\'s text and an unknown id among them', () => {
        [undefined, null, 'Required', 'REQUIRED', 'ui-render:REQUIRED', 3, true, [], {}, { phrase: 'NOT_AN_ID' },
            { phrase: 'toString' }, { phrase: undefined }].forEach(value => {
            expect(isPhraseMessage(value)).toBe(false)
        })
    })
})

describe('phraseParts', () => {
    it('cuts the English text at the placeholders it is given, and trims what is between them', () => {
        expect(phraseParts(value => value, 'FILE_MUST_BE_UNDER', ['file', 'size'])).toEqual([
            { placeholder: 'file' }, 'must be under', { placeholder: 'size' },
        ])
        expect(phraseParts(value => value, 'UPLOAD_FILES_ONLY', ['formats'])).toEqual([
            'Upload', { placeholder: 'formats' }, 'files only',
        ])
    })

    it('cuts the host\'s translation where it puts the placeholders, in its own order', () => {
        const translate = hostTranslate({ 'ui-render:FILE_MUST_BE_UNDER': 'Höchstens {size} für {file}' })

        expect(phraseParts(translate, 'FILE_MUST_BE_UNDER', ['file', 'size'])).toEqual([
            'Höchstens', { placeholder: 'size' }, 'für', { placeholder: 'file' },
        ])
    })

    it('leaves any other placeholder in the text, and a placeholder the text repeats is cut each time', () => {
        const translate = hostTranslate({ 'ui-render:UPLOAD_FILES_ONLY': '{formats} {sise}, {formats}' })

        expect(phraseParts(translate, 'UPLOAD_FILES_ONLY', ['formats'])).toEqual([
            { placeholder: 'formats' }, '{sise},', { placeholder: 'formats' },
        ])
    })

    it('is the text alone where it has none of the placeholders, and asks for the phrase once', () => {
        const { calls, translate } = recording(value => (value === 'ui-render:UPLOAD_FILES_ONLY' ? 'Nur Bilder' : value))

        expect(phraseParts(translate, 'UPLOAD_FILES_ONLY', ['formats'])).toEqual(['Nur Bilder'])
        expect(calls).toEqual(['ui-render:UPLOAD_FILES_ONLY'])
    })
})
