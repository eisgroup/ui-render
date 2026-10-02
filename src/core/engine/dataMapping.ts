/**
 * HOW THE ENGINE NORMALIZES AND COPIES ITS DATA: incoming dates become `YYYY-MM-DD` strings, and
 * `replaceDeepCopy` returns a copy with one key replaced at every depth.
 *
 * It was part of `engine/utils.ts` until §9.9-H6, which dissolved that file into `formData.ts`,
 * `errorMapping.ts` and `dataMapping.ts`.
 */
import { isObject } from '../utils/object'
import { ISO_8601_FULL } from '../utils'

/** A form's values, or a merge of several. */
type Values = Record<string, any>

/**
 * The in-place `replaceDeep` it replaced, returning a copy instead of writing into its argument
 * (`replaceDeep` itself was deleted at §9.6-E3 once nothing called it).
 *
 * Same semantics, which are unusual enough to state: `key` is a bare property NAME, not a path, and
 * EVERY property of that name anywhere in the tree is replaced — at the root, in nested objects and
 * in every array element. `rules.dynamic-actions.test.js` pins that behaviour through the
 * `updateDataOnChange` action, which is its only caller.
 *
 * It exists because that action ran `replaceDeep(this.data, …)` on the object `this.data` returns,
 * which is the live React state, and only then assigned a clone — so the state React had already
 * handed out was rewritten in place first, the defect class §9.3 step 4 closed everywhere else and
 * this one site escaped. Copying every container matches what the old code paid for its
 * `cloneDeep` afterwards, and the value is recursed into after replacing, exactly as the original's
 * second loop did.
 *
 * @param {*} object - the tree to read; never written
 * @param {String} key - the property name to replace wherever it occurs
 * @param {*} value - the replacement
 * @returns {*} a new tree
 */
export const replaceDeepCopy = (object: unknown, key: string, value: unknown): unknown => {
  if (Array.isArray(object)) {
    return object.map(item => replaceDeepCopy(item, key, value))
  }
  if (isObject(object)) {
    const copy: Values = {}
    Object.keys(object).forEach(k => {
      copy[k] = replaceDeepCopy(k === key ? value : object[k], key, value)
    })
    return copy
  }
  return object
}

/*
  Return date in format 'YYYY-MM-DD'
 */
export const getDateStringFromDateObject = (date: Date) => {
  const year = String(date.getUTCFullYear()).padStart(4, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const normalizeIncomingData = (data: unknown): unknown => {
  if (!data) {
    return data
  }

  if (typeof data === 'string') {
    if (ISO_8601_FULL.test(data)) {
      // based on previous solution from Normalize function
      return data.split('T')[0]
    }

    return data
  }

  if (typeof data === 'number') {
    return data
  }

  if (data instanceof Date) {
    return getDateStringFromDateObject(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => normalizeIncomingData(item))
  }

  if (Object.keys(data).length) {
    const nextData: Values = {};
    Object.keys(data).forEach(key => {
      // A cast, not a guard: anything left is an object, or `true`, which has no keys.
      nextData[key] = normalizeIncomingData((data as Values)[key])
    })
    return nextData;
  }

  return data;
}
