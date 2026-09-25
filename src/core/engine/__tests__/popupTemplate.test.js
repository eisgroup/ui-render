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

describe('the rest of a key matches literally', () => {
    // Until this was fixed the key went into the expression unescaped. Both cases below were
    // pinned as defects first; each fails on the old code.
    it('so its `.` is a dot, not any character', () => {
        const nested = template('nested')
        const templates = { 'a.b.{index}': nested }

        expect(findPopupTemplate(templates, 'aXb.3', 0)).toBeNull()
        expect(findPopupTemplate(templates, 'a.b.3', 0)).toEqual({ popupTemplate: nested, templateId: 'a.b.{index}' })
    })

    it('so a key with expression characters neither throws nor breaks the lookup for other ids', () => {
        const broken = template('broken')
        const edit = template('edit')
        const templates = { 'list[.{index}': broken, 'edit.{index}': edit }

        expect(findPopupTemplate(templates, 'edit.3', 0)).toEqual({ popupTemplate: edit, templateId: 'edit.{index}' })
        expect(findPopupTemplate(templates, 'list[.3', 0)).toEqual({ popupTemplate: broken, templateId: 'list[.{index}' })
    })
})
