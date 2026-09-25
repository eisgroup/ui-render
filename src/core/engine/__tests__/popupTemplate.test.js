/**
 * WHICH REGISTERED POPUP TEMPLATE A `popupOpen` ID MEANS.
 * =============================================================================================
 *
 * The lookup `POPUP_OPEN` did inline until §9.3 step 2. Measured before it moved: in the whole suite
 * the second step never found anything and the third always did — every template key contains `{`,
 * since that is what makes `mapper.js` register a template at all, so the second step's candidate
 * matches only an id that still carries a placeholder. `rules.popup-actions.test.js` and
 * `popupScope.nested-data.test.js` open real popups and are what proves the wiring.
 */
import { findPopupTemplate } from '../popupTemplate'

const template = name => ({ title: name, items: [{ view: 'Text', children: name }] })

describe('finding the template', () => {
    it('finds nothing without registered templates', () => {
        expect(findPopupTemplate(undefined, 'edit.3', 0)).toBeNull()
    })

    it('finds the raw id itself', () => {
        const edit = template('edit')

        expect(findPopupTemplate({ 'edit.{index}': edit }, 'edit.{index}', 0))
            .toEqual({ popupTemplate: edit, templateId: 'edit.{index}' })
    })

    it('finds an interpolated id through the key its index was put into', () => {
        const edit = template('edit')

        expect(findPopupTemplate({ 'edit.{index}': edit }, 'edit.3', 0))
            .toEqual({ popupTemplate: edit, templateId: 'edit.{index}' })
    })

    it('prefers the raw id over a pattern', () => {
        const raw = template('raw')
        const pattern = template('pattern')

        expect(findPopupTemplate({ 'x.{index}': pattern, 'x.3': raw }, 'x.3', 0).popupTemplate).toBe(raw)
    })

    it('tries the instance index when the id still carries a placeholder before its number', () => {
        // The only way step 2 can match, since every key contains `{`.
        const byIndex = template('byIndex')

        expect(findPopupTemplate({ 'sec.{code}.1': byIndex }, 'sec.{code}.7', 1))
            .toEqual({ popupTemplate: byIndex, templateId: 'sec.{code}.1' })
    })

    it('finds nothing for an id that is neither registered nor ends in a number', () => {
        expect(findPopupTemplate({ 'edit.{index}': template('edit') }, 'edit', 0)).toBeNull()
    })

    it('finds nothing when no key matches', () => {
        expect(findPopupTemplate({ 'edit.{index}': template('edit') }, 'view.3', 0)).toBeNull()
    })

    it('does not let {index} match anything but digits', () => {
        // `edit.x.3` ends in a number, so it reaches the pattern; `{index}` must not take `x.3`.
        expect(findPopupTemplate({ 'edit.{index}': template('edit') }, 'edit.x.3', 0)).toBeNull()
    })
})

describe('pinned, not fixed', () => {
    it('PINNED DEFECT: a key is not escaped, so its `.` matches any character', () => {
        const nested = template('nested')

        expect(findPopupTemplate({ 'a.b.{index}': nested }, 'aXb.3', 0))
            .toEqual({ popupTemplate: nested, templateId: 'a.b.{index}' })
    })

    it('PINNED DEFECT: one key that is not a valid expression breaks the lookup for every id', () => {
        // `edit.3` has a template of its own; the `[` in an unrelated key throws first.
        const templates = { 'list[.{index}': template('broken'), 'edit.{index}': template('edit') }

        expect(() => findPopupTemplate(templates, 'edit.3', 0)).toThrow(SyntaxError)
    })
})
