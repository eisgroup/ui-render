/**
 * WHAT THE ENGINE READS OUT OF ITS FORMS: every active form's values, merged into one document,
 * with a Select's options reordered the way the submit payload carries them.
 *
 * It was part of `engine/utils.ts` until §9.9-H6, which dissolved that file into `formData.ts`,
 * `errorMapping.ts` and `dataMapping.ts`.
 */
import type { FormApi } from 'final-form'
import { get, merge, isObject, hasObjectValue } from '../utils/object'
import type { RegisteredForm } from '../state/formRegistry'
import { FIELD } from '../modules'
import { cloneDeep } from '../utils'

/** A meta node, as far as these helpers read it. */
export type MetaNode = {
  view?: unknown
  name?: string
  relativePath?: string
  relativeIndex?: number
  mapOptions?: string | { text: string, value?: unknown }
  items?: MetaNode[]
  renderItem?: { items?: MetaNode[] }
  [key: string]: unknown
}

/** A form's values, or a merge of several. */
type Values = Record<string, any>

/** Every active form on the page, as `formsStorage` holds them. */
type Forms = ReadonlyMap<object, RegisteredForm>

export const getFormsData = (forms: Forms) => {
  const formDataArray: Values[] = [];

  forms.forEach(value => {
    const { form, meta } = value;
    // A cast, not a guard: what a form registers as its meta is its document's meta.
    const formData = getStructuredDataFromFormObject(form, meta as MetaNode | undefined);
    if (formData) {
      formDataArray.push(formData);
    }
  })

  return mergeData([...formDataArray]);
}

/**
 * The form a field validates in, as its validator knows it: final-form hands a field's validator the
 * form's current values, the very object `form.getState().values` returns.
 */
export type ValidatingForm = {
  /** The form: the field's document's `form` */
  form: FormApi
  /** The field's name, so the merge reads these values only for a form that registers it */
  name: string
  /** What final-form handed the validator */
  values: Values
}

/**
 * THE LAST MERGE OF EACH PATH, kept on the first array it merged (2026-10-12).
 *
 * `notWithinRange` merges the rows for every field it validates, and final-form validates every
 * field on a change: one edit of a 200-row period table merged its rows 400 times. Each merge read
 * every form's state, and `form.getState()` computes the state of each of the form's fields, about
 * 1 ms for that table's 401: the edit spent some 400 ms reading. Now the form the field validates in
 * is read from what final-form handed the validator (`ValidatingForm`), and a merge is kept while
 * every form holds the very array it held. final-form makes a new array for each change and each
 * array mutator, and the engine replaces a form's array whole when it writes one (`submit`): nothing
 * changes one in place.
 *
 * The rows are shared between the calls that get them: read them, do not change them. Each call gets
 * an array of its own.
 */
const lastMerges = new WeakMap<unknown[], Map<string, { arrays: unknown[][], rows: object[] }>>()

/**
 * Whether two form objects are one final-form instance. react-final-form hands a new `{...form, reset}`
 * on each render, each sharing the instance's methods, so an instance is told apart by them, as the
 * form layer's handle tells it (`renderForm` in `modules/form/utils.tsx`).
 */
function sameForm (a: FormApi, b: FormApi): boolean {
  return a === b || a.getState === b.getState
}

/** Whether `form` registers the field `name`: by its published state, or, before that, its field list. */
function registers (form: FormApi, name: string): boolean {
  return form.getFieldState(name) !== undefined || form.getRegisteredFields().indexOf(name) !== -1
}

/**
 * Live {@code dataKind.*} array: merge each row from every form that holds {@code path} in
 * {@code form.getState().values}, shallow-merge row objects (later forms in {@code forms} order win).
 * Length is capped to the minimum array length among those forms so a stale longer copy on the
 * master form does not leave ghost rows after FieldArray.remove (lodash merge keeps trailing indices).
 *
 * @param {string} path - e.g. {@code orders.dataKind.lines} or {@code dataKind.line}
 * @param {Map} forms - {@link formsStorage}
 * @param {ValidatingForm} [validating] - the form a validator runs in, read from its values
 * @returns {Array<Object>}
 */
export function getLiveMergedDataKindArray (path: string, forms: Forms, validating?: ValidatingForm): object[] {
  const arrays: unknown[][] = []
  forms.forEach(({ form }) => {
    if (!form || typeof form.getState !== 'function') return
    const values = validating && sameForm(form, validating.form) && registers(form, validating.name)
      ? validating.values
      : form.getState().values
    const arr = get(values, path)
    if (Array.isArray(arr) && arr.length > 0) {
      arrays.push(arr)
    }
  })
  if (!arrays.length) {
    return []
  }
  const kept = lastMerges.get(arrays[0])
  const last = kept && kept.get(path)
  if (last && last.arrays.length === arrays.length && last.arrays.every((array, i) => array === arrays[i])) {
    return last.rows.slice()
  }
  const cap = Math.min(...arrays.map(a => a.length))
  const out: object[] = []
  for (let i = 0; i < cap; i++) {
    let row: object = {}
    for (const arr of arrays) {
      const piece = arr[i]
      if (piece != null && typeof piece === 'object' && !Array.isArray(piece)) {
        row = { ...row, ...piece }
      }
    }
    out.push(hasObjectValue(row) ? row : {})
  }
  const byPath = kept || new Map()
  byPath.set(path, { arrays, rows: out })
  if (!kept) lastMerges.set(arrays[0], byPath)
  return out.slice()
}

/**
 * Get raw form values without Select reordering.
 * Used for showIf lookups where array indices must match the original data order.
 */
export const getRawFormsData = (forms: Forms) => {
  const formDataArray: Values[] = [];

  forms.forEach(value => {
    const { form, meta } = value;
    // A cast, not a guard: as in `getFormsData`.
    const { relativePath, relativeIndex } = (meta || {}) as MetaNode;
    if (relativePath && typeof relativeIndex === 'undefined') return;

    const formValues = cloneDeep(form.getState().values);

    if (!relativePath) {
      formDataArray.push(formValues);
    } else {
      // Not undefined: a relative path without an index returned above.
      formDataArray.push(createObjectStructure(formValues, relativePath, relativeIndex!));
    }
  })

  return mergeData([...formDataArray]);
}

const getStructuredDataFromFormObject = (form: FormApi, meta: MetaNode | undefined) => {
  const { relativePath, relativeIndex } = meta || {};

  if (relativePath && typeof relativeIndex === 'undefined') {
    return;
  }

  const formValues = cloneDeep(form.getState().values);
  const formState = changeOptionOrderForSelectFields(formValues, meta);

  if (!relativePath) {
    return formState;
  }

  // Not undefined: a relative path without an index returned above.
  return createObjectStructure(formState, relativePath, relativeIndex!);
}

const createObjectStructure = (value: unknown, relativePath: string, relativeIndex: number): Values => {
  return relativePath.split('.').reverse().reduce((acc: Values, item, index) => {
    const result: Values = {};
    if (index === 0) {
      const tmpArray: unknown[] = [];
      tmpArray[relativeIndex] = value;
      result[item] = tmpArray;
    } else {
      result[item] = acc;
    }

    return result;
  }, {})
}

const mergeData = (formData: Values[]) => {
  let masterDataIndex = -1;
  // Find Master object which contains all data structure
  // It should be one object in array
  // All other objects contain only one property at the first level of the structure
  let result = formData.find((formValues, index) => {
    if (Object.keys(formValues).length !== 1) {
      masterDataIndex = index;
      return true
    }
    return false;
  })

  formData.forEach((formValues, index) => {
    if (index === masterDataIndex) {
      return;
    }

    result = merge(result, formValues);
  })

  return result;
}

// Find Select fields and change options order in case select was changed
/** Exported for its unit tests: no other module imports it. */
export const changeOptionOrderForSelectFields = (data: Values, meta: MetaNode | undefined) => {
  // find data related to Select and change options order
  const recursiveDataParser = (data: unknown, optionName: string, selectValue: unknown) => {
    let isDataOrderChanged = false
    const optionIndex = Number(selectValue)
    if (String(selectValue).trim() === '' || !Number.isSafeInteger(optionIndex) || optionIndex < 0) {
      return isDataOrderChanged
    }
    if (isObject(data)) {
      Object.keys(data).forEach(key => {
        const options = data[key]
        if (
          Array.isArray(options) &&
          options[0] &&
          // @Note: truthiness, not `hasOwnProperty`. This heuristic guesses which array is the
          // Select's option list; keying off mere key presence also matches unrelated arrays whose
          // first element carries the key with a falsy value, and reorders them in the payload.
          options[0][optionName] &&
          optionIndex < options.length &&
          optionIndex in options &&
          options[optionIndex] != null
        ) {
          options.unshift(options.splice(optionIndex, 1)[0]);
          isDataOrderChanged = true
        }
      })
    }
    return isDataOrderChanged
  }

  if (meta && meta.view === FIELD.TYPE.SELECT) {
    const selectName = meta.name as string; // a cast, not a guard: a Select names its field
    if (typeof data[selectName] === 'string') {
      // @Note: no destructuring of `mapOptions` before its type is known. It used to read
      //  `const {text, value} = mapOptions` ABOVE these branches, which throws
      //  `Cannot destructure property 'text' of 'mapOptions' as it is undefined` for any
      //  `view: 'Select'` node that has a string value and declares no `mapOptions` — i.e.
      //  `getFormData()` threw, in the SUBMIT path, for the simplest Select a meta can express.
      //  Every tracked example escaped it only by declaring `mapOptions` in JSON. There is
      //  nothing to reorder without it, so the branch is simply skipped.
      const { mapOptions } = meta;
      if (typeof mapOptions === 'string') {
        recursiveDataParser(data, mapOptions, data[selectName]) && delete data[selectName]
      } else if (isObject(mapOptions) && mapOptions.value === '{index}') {
        recursiveDataParser(data, mapOptions.text, data[selectName]) && delete data[selectName]
      }
    }
  }

  if (meta && Array.isArray(meta.items)) {
    meta.items.forEach(item => {
      changeOptionOrderForSelectFields(data, item)
    })
  } else if (meta && meta.renderItem && Array.isArray(meta.renderItem.items)) {
    meta.renderItem.items.forEach(item => {
      changeOptionOrderForSelectFields(data, item)
    })
  }

  return data;
}
