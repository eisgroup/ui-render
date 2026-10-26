/**
 * WHAT THE ENGINE READS OUT OF ITS FORMS: every active form's values, merged into one document,
 * with a Select's options reordered the way the submit payload carries them.
 *
 * It was part of `engine/utils.ts` until §9.9-H6, which dissolved that file into `formData.ts`,
 * `errorMapping.ts` and `dataMapping.ts`.
 */
import type { FormApi } from 'final-form'
import { get, merge, isEqual, isObject, hasObjectValue, set, unset } from '../utils/object'
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
  return mergeForms(forms, changeOptionOrderForSelectFields);
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
const lastMerges = new WeakMap<unknown[], Map<string, { arrays: unknown[][], owned: Owned[], rows: object[] }>>()

/**
 * What a table row with a form of its own holds of an array, and what it started from: its row, at `index`, or the
 * array itself, when the array is inside its row.
 */
type Owned = { index?: number, values: unknown, initial: unknown }

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
 * The place of a table row with a form of its own, such as `dataKind.items[1]`, read from the meta its form registers:
 * its `relativePath` and its `relativeIndex`. Its fields are named by it (`mapper.tsx`), and its form holds the row there
 * (`engine/Data.tsx`). `undefined` for any other form.
 */
export function rowPlaceOf (meta: MetaNode | undefined): string | undefined {
  const { relativePath, relativeIndex } = meta || {}
  return relativePath && typeof relativeIndex !== 'undefined' ? `${relativePath}[${relativeIndex}]` : undefined
}

/** A path in dots: `dataKind.phases[0].dataKind.items` and `dataKind.phases.0.dataKind.items` name one place. */
const dotted = (path: string) => path.replace(/\[(\d+)\]/g, '.$1')

/** Whether `piece` is a row: an object, and not an array. */
const isRow = (piece: unknown): piece is object => piece != null && typeof piece === 'object' && !Array.isArray(piece)

/** A step of a path in values: a key of an object, or an index of an array. */
type Step = string | number

/**
 * Something a form changed of the values it started from, at `path`: the value there now, no value there any more
 * (`removed`), or, at an array's `length`, an array made shorter.
 */
export type Change = { path: Step[], value?: unknown, removed?: true }

/**
 * What `current` changed of `initial`, each change at its path, in objects and arrays; none for what stayed. A table
 * row's own form starts from the row's values, so this is what the row's fields changed of it.
 *
 * A value `current` no longer holds is a change too (2026-10-26): final-form drops a value set to `undefined`, as a
 * field with `normalize: 'date'` sets it when it is cleared, and the document's copy showed the value it had again.
 */
export function changesOf (initial: unknown, current: unknown, path: Step[] = [], changes: Change[] = []): Change[] {
  if (Object.is(initial, current)) return changes
  if (current === undefined) {
    // A row its form does not hold at all is no change to the row: the form holds a row only at its place.
    if (path.length) changes.push({ path, removed: true })
  } else if (isObject(current) && isObject(initial)) {
    Object.keys(current).forEach(key => changesOf(initial[key], current[key], [...path, key], changes))
    Object.keys(initial).forEach(key => {
      if (!(key in current) && initial[key] !== undefined) changes.push({ path: [...path, key], removed: true })
    })
  } else if (Array.isArray(current) && Array.isArray(initial)) {
    for (let index = 0; index < current.length; index++) changesOf(initial[index], current[index], [...path, index], changes)
    if (current.length < initial.length) changes.push({ path: [...path, 'length'], value: current.length })
  } else if (!isEqual(initial, current)) {
    changes.push({ path, value: current })
  }
  return changes
}

/**
 * Writes `changes` into `target`, under `at`, where `target` is the caller's own copy: a value copied, a value no longer
 * held deleted, and an array cut to its length. A whole row or array its form had no start for is merged over what is
 * there, as every row form's values were before they had one.
 */
function applyChanges (target: object, at: Step[], changes: Change[]): void {
  changes.forEach(({ path, value, removed }) => {
    const to = [...at, ...path]
    if (removed) {
      unset(target, to)
    } else if (path[path.length - 1] === 'length') {
      const array = get(target, to.slice(0, -1))
      if (Array.isArray(array) && array.length > Number(value)) array.length = Number(value)
    } else {
      const there = path.length ? undefined : get(target, to)
      set(target, to, isObject(there) && isObject(value) ? merge(there, value) : cloneDeep(value))
    }
  })
}

/** Whether a change of the rows of an array, by their index, leaves them rows among the first `cap`: a row, not a value. */
function keepsRows ({ path, value, removed }: Change, cap: number): boolean {
  const [first] = path
  if (first === 'length') return true
  if (typeof first !== 'number' || first >= cap) return false
  return path.length > 1 || (!removed && isRow(value))
}

/**
 * Live {@code dataKind.*} array: merge each row from every form that holds {@code path} in
 * {@code form.getState().values}, shallow-merge row objects (later forms in {@code forms} order win).
 * Length is capped to the minimum array length among those forms so a stale longer copy on the
 * master form does not leave ghost rows after FieldArray.remove (lodash merge keeps trailing indices).
 *
 * A table row with a form of its own (`rowPlaceOf`) gives what it changed of what it started from (`changesOf`),
 * written over the documents' copy and counted in no cap, as `mergeForms` takes it (2026-10-26):
 * - for a row of this array, what it changed of that row;
 * - for an array inside its row, a table nested in it, what it changed of that array, row by row;
 * - for an array elsewhere, nothing.
 *
 * A `useForm` row's form held the array up to its own index once the row was edited, so the cap dropped the rows after
 * it, and the document's copy, merged after it, took its edit back: a submit sent what was left. Since its form starts
 * from the whole row, taken whole it would bring back the row as it started over an edit another form made of it, such
 * as a field in the row's expanded content, which the document's form holds.
 *
 * @param {string} path - e.g. {@code orders.dataKind.lines} or {@code dataKind.line}
 * @param {Map} forms - {@link formsStorage}
 * @param {ValidatingForm} [validating] - the form a validator runs in, read from its values
 * @returns {Array<Object>}
 */
export function getLiveMergedDataKindArray (path: string, forms: Forms, validating?: ValidatingForm): object[] {
  const arrays: unknown[][] = []
  const owned: Owned[] = []
  const at = dotted(path)
  forms.forEach(({ form, meta }) => {
    if (!form || typeof form.getState !== 'function') return
    const handed = validating && sameForm(form, validating.form) && registers(form, validating.name)
    // A cast, not a guard: what a form registers as its meta is its document's meta.
    const rowMeta = meta as MetaNode | undefined
    const place = rowPlaceOf(rowMeta)
    if (!place) {
      const arr = get(handed ? validating!.values : form.getState().values, path) // not undefined: `handed` says so
      if (Array.isArray(arr) && arr.length > 0) {
        arrays.push(arr)
      }
      return
    }
    const own = dotted(rowMeta!.relativePath!) === at // not undefined: `rowPlaceOf` read both
    if (!own && !at.startsWith(`${dotted(place)}.`)) return
    // A row's form has a field or two: its state, for what it started from, is cheap.
    const state = form.getState()
    const where = own ? place : path
    owned.push({
      index: own ? Number(rowMeta!.relativeIndex) : undefined,
      values: get(handed ? validating!.values : state.values, where),
      initial: get(state.initialValues, where),
    })
  })
  if (!arrays.length) {
    return []
  }
  const kept = lastMerges.get(arrays[0])
  const last = kept && kept.get(path)
  if (
    last && last.arrays.length === arrays.length && last.arrays.every((array, i) => array === arrays[i]) &&
    last.owned.length === owned.length &&
    last.owned.every((was, i) => was.index === owned[i].index && was.values === owned[i].values && was.initial === owned[i].initial)
  ) {
    return last.rows.slice()
  }
  const cap = Math.min(...arrays.map(a => a.length))
  const out: object[] = []
  for (let i = 0; i < cap; i++) {
    let row: object = {}
    for (const arr of arrays) {
      const piece = arr[i]
      if (isRow(piece)) {
        row = { ...row, ...piece }
      }
    }
    out.push(hasObjectValue(row) ? row : {})
  }
  // Written over a copy: the rows hold the objects of the documents' values.
  const changed = owned.map(({ index, values, initial }) => ({ index, changes: changesOf(initial, values) }))
    .filter(({ changes }) => changes.length > 0)
  const rows = { all: changed.length ? cloneDeep(out) : out }
  changed.forEach(({ index, changes }) => {
    if (index === undefined) {
      applyChanges(rows, ['all'], changes.filter(change => keepsRows(change, cap)))
    } else if (index < cap) {
      applyChanges(rows, ['all', index], changes.filter(({ path, value, removed }) => path.length > 0 || (!removed && isRow(value))))
    }
  })
  const byPath = kept || new Map()
  byPath.set(path, { arrays, owned, rows: rows.all })
  if (!kept) lastMerges.set(arrays[0], byPath)
  return rows.all.slice()
}

/**
 * Get raw form values without Select reordering.
 * Used for showIf lookups where array indices must match the original data order.
 */
export const getRawFormsData = (forms: Forms) => {
  return mergeForms(forms, values => values);
}

/**
 * THE FORMS' VALUES IN ONE DOCUMENT: the forms that hold it from its root, as `mergeData` merges them, then
 * the row that each table row's own form holds, written over the document's copy of that row (2026-10-23).
 *
 * A table row with a form of its own registers the row's place as its meta's `relativePath` and
 * `relativeIndex` (`rowPlaceOf`). That is the add row a `renderExtraItem` declaration renders, or a row a
 * `useForm` declaration gives a form. Its fields are named by that place (`dataKind.periods[1].startDate`), so its
 * values hold the row there already. They were placed there a second time, at
 * `dataKind.periods[1].dataKind.periods[1]`. Measured: a `showIf` in the add row never saw the row's own
 * fields, and an edit in a `useForm` row put a copy of the table inside that row in `getFormData`.
 *
 * - Only what the form changed of the row is taken (`changesOf`), and only that is copied. A `useForm` row's
 *   form starts from the row's values there (`engine/Data.tsx`): what its fields leave alone is the document's,
 *   which another form may have edited, such as a field in the row's expanded content (2026-10-26). An add
 *   row's starts from the `initialValues` its meta declares, at the root of its values, where none of its
 *   fields reads, so all it holds at the row is what its user typed.
 * - The row goes into the document's own containers. In containers of its own, the row of a table nested
 *   in a row (`dataKind.phases.0.dataKind.lineItems[2]`) made `phases` an object, which the merge put in
 *   place of the document's array of phases.
 * - The rows go last. Forms register as they mount, children first, and `mergeData` finds no master in a
 *   document with one key at its root, so the document's copy of an edited row came last and won.
 *
 * @param {Map} forms - the forms to merge, `formsOf` or `dataFormsOf` a document tree
 * @param {Function} fromRoot - what a form that holds the document from its root contributes of its values
 * @returns {Object|undefined} the merged values, or `undefined` when no form contributes any
 */
function mergeForms (forms: Forms, fromRoot: (values: Values, meta: MetaNode | undefined) => Values) {
  const documents: Values[] = [];
  const rows: Array<{ place: string, changes: Change[] }> = [];

  forms.forEach(value => {
    const { form } = value;
    // A cast, not a guard: what a form registers as its meta is its document's meta.
    const meta = value.meta as MetaNode | undefined;
    const place = rowPlaceOf(meta);
    if (!place) {
      if (meta && meta.relativePath) return;
      documents.push(fromRoot(cloneDeep(form.getState().values), meta));
      return;
    }
    // Its fields are named `${place}.${name}` (`mapper.tsx`). What it changed of the row only (`changesOf`): a `useForm`
    // row's form starts from the whole row, and an array up to its index, which a copy would walk hole by hole.
    const { values, initialValues } = form.getState();
    const changes = changesOf(get(initialValues, place), get(values, place));
    if (changes.length) rows.push({ place, changes });
  })

  const merged = mergeData(documents);
  if (!rows.length) return merged;
  // Written in place, which changes no form: each form's values were cloned before they were merged, and what a change
  // writes is copied.
  const result: Values = merged || {};
  rows.forEach(({ place, changes }) => {
    const at = { row: get(result, place) };
    applyChanges(at, ['row'], changes);
    if (at.row !== undefined) set(result, place, at.row);
  });
  return result;
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
