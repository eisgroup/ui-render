/**
 * WHICH REGISTERED POPUP TEMPLATE A `popupOpen` ID MEANS.
 * =============================================================================================
 *
 * Lifted out of the `POPUP_OPEN` handler at §9.3 step 2. A `Popup` whose id contains a placeholder —
 * `edit.{index}` — is registered by `mapper.js` as a TEMPLATE, keyed by that raw id; a static id is
 * stored ready-made in `popupById` instead and never reaches this. The caller may ask for the raw id
 * or, far more often, for one already interpolated — `edit.3` — and this finds the template meant:
 *
 *   1. the id itself, which matches only when the caller passed the raw id
 *   2. for an id ending in `.<number>`: the id's base with the INSTANCE's index put back —
 *      `edit.{index}` asked as `edit.3` from row 1 tries `edit.1`. Every template key contains `{`,
 *      because that is what makes it a template, so this can match only when the id still carries
 *      an uninterpolated placeholder before its number. Nothing in the suite or the corpus does; it
 *      is kept because it is not provably unreachable.
 *   3. for such an id: the first key whose `{index}`, read as digits, matches the whole id
 *
 * TWO DEFECTS IN STEP 3, pinned by `popupTemplate.test.js` rather than fixed here: the key is turned
 * into a regular expression WITHOUT ESCAPING, so its `.` matches any character — `a.b.{index}` also
 * claims `aXb.3` — and a key whose characters do not form a valid expression, an unbalanced `[` say,
 * throws a SyntaxError. Since every key is tried, that one template breaks step 3 for every id.
 *
 * @param {Object} [popupTemplates] - the instance's registered templates, keyed by raw id
 * @param {string} id - the id `popupOpen` was asked for
 * @param {*} index - the instance's `props.index`, used by step 2
 * @returns {?{popupTemplate: Object, templateId: string}} the template and the key it was found by
 *   (step 2's candidate for that step), or null when there is none
 */
export function findPopupTemplate (popupTemplates, id, index) {
    if (!popupTemplates) return null

    if (popupTemplates[id]) return { popupTemplate: popupTemplates[id], templateId: id }
    if (!/\.\d+$/.test(id)) return null

    const withInstanceIndex = `${id.replace(/\.\d+$/, '')}.${index}`
    if (popupTemplates[withInstanceIndex]) {
        return { popupTemplate: popupTemplates[withInstanceIndex], templateId: withInstanceIndex }
    }

    const matchingTemplate = Object.keys(popupTemplates).find(key => {
        const templatePattern = key.replace(/\{index\}/g, '\\d+')
        return new RegExp(`^${templatePattern}$`).test(id)
    })
    return matchingTemplate
        ? { popupTemplate: popupTemplates[matchingTemplate], templateId: matchingTemplate }
        : null
}
