/**
 * WHAT THE ENGINE READS OUT OF ITS FORMS: every active form's values, merged into one document,
 * with a Select's options reordered the way the submit payload carries them.
 *
 * It was part of `engine/utils.ts` until §9.9-H6, which dissolved that file into `formData.ts`,
 * `errorMapping.ts` and `dataMapping.ts`.
 */
import { getIn, setIn } from 'final-form'
import type { FormApi } from 'final-form'
import { get, merge, isEqual, isEqualJSON, isObject, hasObjectValue, set } from '../utils/object'
import type { RegisteredForm } from '../state/formRegistry'
import { FIELD } from '../modules'
import { fieldNamesOf } from '../modules/form/batchedForm'
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
 * A table row with a form of its own, as a merge of an array reads it: its place, its values and those it started with
 * (`startOf`), what each holds where the merge reads it (`held` and `started`: its row, or the array, when the array is
 * inside its row), which changes with any of its values there, and its fields.
 */
type Owned = { place: string, values: Values, start: Values, held: unknown, started: unknown, fields: readonly string[] }

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

/** How deep a place is: how many steps its path has. */
const depthOf = (place: string) => dotted(place).split('.').length

/** Whether `piece` is a row: an object, and not an array. */
const isRow = (piece: unknown): piece is object => piece != null && typeof piece === 'object' && !Array.isArray(piece)

/** `value`, or, where it is an object or an array, a copy of it: what a merge gives shares nothing with a form's state. */
const copyOf = (value: unknown) => value !== null && typeof value === 'object' ? cloneDeep(value) : value

/**
 * The fields of a table row's own form, by name: every one it has registered (`fieldNamesOf`), the ones that have gone
 * included, or, for a form `createBatchedForm` did not make, the ones it registers now.
 */
function fieldsOf (form: FormApi): readonly string[] {
  return fieldNamesOf(form) || (typeof form.getRegisteredFields === 'function' ? form.getRegisteredFields() : [])
}

/** The names of `fields` inside `place`, in dots: those of a row's own form inside its row. */
function namesInside (fields: readonly string[], place: string): string[] {
  const inside = `${dotted(place)}.`
  return fields.map(dotted).filter(name => name.startsWith(inside))
}

/** Whether a form's value at `name` is the one it started with (`start`, `startOf` it): an object by its value. */
const startedWith = (values: Values, start: Values, name: string) => isEqual(getIn(values, name), getIn(start, name))

/**
 * The names of `fields` inside `place` whose value a row's own form changed: what it holds there is not what it started
 * with (2026-10-27). A field it shows and leaves alone gives nothing: the value there is the document's, which another
 * form may have edited, such as a field of the same name in the row's expanded content.
 */
function changedInside (fields: readonly string[], place: string, values: Values, start: Values): string[] {
  return namesInside(fields, place).filter(name => !startedWith(values, start, name))
}

/**
 * WHAT A TABLE ROW'S OWN FORM STARTED WITH, MOVED WHERE A SUBMIT WROTE ITS VALUES INTO THE DOCUMENT'S FORM (2026-10-27).
 *
 * A row's form gives the merges the fields it changed of its start, and the rest is the document's (`changedInside`). A
 * submit writes the merged rows into the document's form, in place (`submit` in `rules.tsx`), so the document holds a
 * row's edits from then on. Measured from its `initialValues`, an edit set back after a submit was no change, and gave
 * nothing: the document's copy, holding the edit, came back in `getFormData`, a `showIf` and the next submit. So what
 * the forms holding the document from its root hold of a row's changes becomes its start (`restartWrittenRows`), field
 * by field, and an edit set back is a change of it. What another form holds is no start: a submit that a row's own
 * document makes writes into the row's form, which the document's form does not read.
 *
 * Kept here rather than in the form: re-initializing the form would make its fields pristine and untouched again. Kept
 * for the `initialValues` the form had, so that new ones, a host's new data or the document's new rows, start it anew.
 * Keyed by the form's `getState`, which every copy of the form react-final-form hands out shares (`sameForm`).
 */
const movedStarts = new WeakMap<object, { initial: unknown, start: Values }>()

/** What a table row's own form started with, as the merges measure its changes (`movedStarts`): its `initialValues`, or more. */
function startOf (form: FormApi, initialValues: Values | undefined): Values {
  const moved = movedStarts.get(form.getState)
  return moved && moved.initial === initialValues ? moved.start : initialValues || {}
}

/**
 * Each table row's own form among `forms` takes, as the value it started with, the value of each field it changed that
 * the forms holding the document from its root hold now (`documentValuesOf`): what a submit wrote there, a value taken
 * away included (`movedStarts`). A field whose value they do not hold keeps its start: one of a row the submit did not
 * write, and every one where the submit wrote into another form than theirs, as a row's own form does when a button in
 * the row's cells submits it, or a field there with `autoSubmit` (2026-10-27). The submit calls it as it writes, before
 * final-form validates: one that validation stops has written all the same.
 *
 * @param {Map} forms - the forms of the document tree, `dataFormsOf` it
 */
export function restartWrittenRows (forms: Forms): void {
  const values = documentValuesOf(forms) || {}
  forms.forEach(({ form, meta }) => {
    // A cast, not a guard: what a form registers as its meta is its document's meta.
    const place = rowPlaceOf(meta as MetaNode | undefined)
    if (!place || !form || typeof form.getState !== 'function') return
    const state = form.getState()
    const start = startOf(form, state.initialValues)
    const written = changedInside(fieldsOf(form), place, state.values, start)
      .filter(name => isEqual(getIn(values, name), getIn(state.values, name)))
    if (!written.length) return
    // A copy, field by field: the start was the form's own `initialValues`, which nothing may change.
    const moved = written.reduce((next: unknown, name) => writeField(next, name, getIn(state.values, name)), start) as Values
    movedStarts.set(form.getState, { initial: state.initialValues, start: moved })
  })
}

/**
 * What the forms among `forms` that hold the document from its root hold, merged as `mergeForms` merges them: a
 * document's own form, and a block's with a form of its own, and no table row's. `undefined` where there is none.
 */
function documentValuesOf (forms: Forms): Values | undefined {
  const documents: Values[] = []
  forms.forEach(({ form, meta }) => {
    // A cast, not a guard: what a form registers as its meta is its document's meta.
    const node = meta as MetaNode | undefined
    if (!form || typeof form.getState !== 'function' || rowPlaceOf(node) || (node && node.relativePath)) return
    documents.push(cloneDeep(form.getState().values))
  })
  return mergeData(documents)
}

/**
 * `target` with `value` written at `at`, a path inside it, as final-form writes a field's value into a form's values
 * (`setIn`): each object on the way copied, so the target is changed only where it is a copy of its own. `undefined`,
 * the value of a field its form no longer holds, as a cleared date leaves it, takes the value at `at` away, and each
 * object that leaves empty, but the target, which stays an empty row. Where nothing is there, nothing changes: a value
 * set to `undefined` there would make a row of nothing. A target that has another shape at `at`, an index into an
 * object or a key of an array, which final-form throws for, is left as it is.
 */
function writeField (target: unknown, at: string, value: unknown): unknown {
  try {
    if (value === undefined) {
      if (getIn(target as object, at) === undefined) return target
      return setIn(target as object, at, undefined) || {}
    }
    return setIn(target !== null && typeof target === 'object' ? target : {}, at, copyOf(value))
  } catch (anotherShape) {
    return target
  }
}

/**
 * Live {@code dataKind.*} array: merge each row from every form that holds {@code path} in
 * {@code form.getState().values}, shallow-merge row objects (later forms in {@code forms} order win).
 * Length is capped to the minimum array length among those forms so a stale longer copy on the
 * master form does not leave ghost rows after FieldArray.remove (lodash merge keeps trailing indices).
 *
 * A table row with a form of its own (`rowPlaceOf`) gives the values of the fields it changed, and nothing else, each
 * written at its name over the documents' rows and counted in no cap, as `mergeForms` takes them (2026-10-27):
 * - a field of a row of this array, or of a row inside one, such as a `useForm` line of a table in a row's expanded
 *   content, in that row: a submit writes only the top arrays back (`submit` in `rules.tsx`), so a line's edit went
 *   unsent until 2026-10-27;
 * - a field inside this array, where the array is inside its row, in that row of the array; and a field that holds
 *   the array, as a table's does (`FieldArray`), as the rows;
 * - a field elsewhere, nowhere.
 * Shallowest place first: a row with a form of its own inside another such row writes after it.
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
    // A row of this array, or a row inside one; else a row this array is inside of, or none of them.
    const inside = dotted(place).startsWith(`${at}.`)
    if (!inside && !at.startsWith(`${dotted(place)}.`)) return
    // A row's form has a field or two: its state, for what it started with, is cheap.
    const state = form.getState()
    const values = handed ? validating!.values : state.values
    const start = startOf(form, state.initialValues)
    const where = inside ? place : path
    owned.push({
      place, values, start, held: getIn(values, where), started: getIn(start, where), fields: fieldsOf(form),
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
    last.owned.every((was, i) => was.place === owned[i].place && was.held === owned[i].held &&
      was.started === owned[i].started && sameNames(was.fields, owned[i].fields))
  ) {
    return last.rows.slice()
  }
  const rows = mergeRows(at, arrays, owned)
  const byPath = kept || new Map()
  byPath.set(path, { arrays, owned, rows })
  if (!kept) lastMerges.set(arrays[0], byPath)
  return rows.slice()
}

/** Whether two lists of names are the same names, in the same order. */
function sameNames (a: readonly string[], b: readonly string[]): boolean {
  return a === b || (a.length === b.length && a.every((name, i) => name === b[i]))
}

/**
 * The rows of the array at `at`, a path in dots: the documents' `arrays` merged row by row, up to the shortest, and the
 * fields of the rows with a form of their own written over them (`getLiveMergedDataKindArray`).
 */
function mergeRows (at: string, arrays: unknown[][], owned: Owned[]): object[] {
  const cap = Math.min(...arrays.map(a => a.length))
  let rows: object[] = []
  for (let i = 0; i < cap; i++) {
    let row: object = {}
    for (const arr of arrays) {
      const piece = arr[i]
      if (isRow(piece)) {
        row = { ...row, ...piece }
      }
    }
    rows.push(hasObjectValue(row) ? row : {})
  }
  // Each row is replaced, not changed: the rows hold the objects of the documents' values.
  const inside = `${at}.`
  owned.slice().sort((a, b) => depthOf(a.place) - depthOf(b.place)).forEach(({ place, values, start, fields }) => {
    changedInside(fields, place, values, start).forEach(name => {
      const value = getIn(values, name)
      // A field that holds the array: its rows are the rows.
      if (name === at) {
        rows = Array.isArray(value) ? value.map(row => isRow(row) ? copyOf(row) as object : {}) : []
        return
      }
      if (!name.startsWith(inside)) return
      const rest = name.slice(inside.length)
      const dot = rest.indexOf('.')
      const index = Number(dot === -1 ? rest : rest.slice(0, dot))
      // A row past the documents' rows is one just removed there.
      if (!Number.isInteger(index) || index < 0 || index >= rows.length) return
      rows[index] = dot === -1
        ? (isRow(value) ? copyOf(value) as object : {})
        : writeField(rows[index], rest.slice(dot + 1), value) as object
    })
  })
  return rows
}

/**
 * A row `changedRowsFor` gives: where it is, the row as it is to be written there, and, where the row may go back into
 * the data as its form's `initialValues` hold it, that row (`initial`).
 */
export type ChangedRow = { place: string, row: unknown, initial?: object }

/** The document's form the rows were written into, and its values once they were, as `settleWrittenRows` reads them. */
export type WrittenForm = { form: { getState: unknown }, values: Values }

/**
 * THE ROWS WHOSE OWN FORMS HOLD WHAT `form` DOES NOT, AS `form` IS TO HOLD THEM (2026-10-27): for each table row with a
 * form of its own, its place and the row as `form`'s values have it, with the values of the fields the row's form
 * changed of its start (`changedInside`, `startOf`) written at their names (`writeField`), as `mergeForms` writes them,
 * where that makes the row another. An Add and a Remove write them into the document's form before they add or remove
 * a row there (`dataKindPush.ts`): the data they rebuild is that form's values.
 *
 * - Left out: a row its array in `form`'s values does not hold, as the live merge leaves it out (one just removed, or a
 *   hole in the array a row's own form holds), a row whose place there has another shape, which final-form throws
 *   for, and `form` itself, whose values hold its fields.
 * - Shallowest first, each written over the rows before it, as `mergeForms` writes them: a row with a form of its own
 *   inside another such row comes after it, and is in the outer row as given.
 * - `initial` is the row the row's form's `initialValues` hold, where putting it back leaves that form as it is: they
 *   hold just that row at its place, as a `useForm` row's do (`engine/Data.tsx`), `form` holds the row just so, and
 *   each row given inside it has an `initial` too. An Add or a Remove that leaves the row where it was, and as it was,
 *   puts it back into the data it rebuilds. A form that starts from the whole document, a `null` row's or one whose
 *   cells read the document (`relativeData: false`), starts again from that data whatever they did to its row: its
 *   values must be in it, and so in any row around it. Found in review: put back, an outer row took a `null` line's
 *   value away.
 *
 * @param {Object} form - the form the rows are to be written into, as far as its values are read
 * @param {Map} forms - the forms of its document tree, `dataFormsOf`
 * @returns {Array<ChangedRow>} the rows to write, each at its place, shallowest first
 */
export function changedRowsFor (form: { getState: () => { values?: unknown } }, forms: Forms): ChangedRow[] {
  const { values } = form.getState()
  const owned: Array<{ place: string, names: string[], values: Values, initialValues: unknown }> = []
  forms.forEach(entry => {
    // A cast, not a guard: what a form registers as its meta is its document's meta.
    const meta = entry.meta as MetaNode | undefined
    const place = rowPlaceOf(meta)
    if (!place || entry.form.getState === form.getState) return
    const rows = get(values, meta!.relativePath!) // not undefined: `rowPlaceOf` read both
    if (!Array.isArray(rows) || !(Number(meta!.relativeIndex) in rows)) return
    const state = entry.form.getState()
    const names = changedInside(fieldsOf(entry.form), place, state.values, startOf(entry.form, state.initialValues))
    if (names.length) owned.push({ place, names, values: state.values, initialValues: state.initialValues })
  })
  // A cast, not a guard: the values hold the rows' arrays, read above.
  let next = values as object
  const changed: Array<{ place: string, initial?: object }> = []
  owned.sort((a, b) => depthOf(a.place) - depthOf(b.place)).forEach(({ place, names, values: own, initialValues }) => {
    const row = get(next, place)
    const from = dotted(place).length + 1
    const written = names.reduce((target: unknown, name) => writeField(target, name.slice(from), getIn(own, name)), row)
    if (isEqual(written, row)) return
    try {
      next = setIn(next, place, written)
    } catch (anotherShape) {
      return
    }
    const initial = get(initialValues, place)
    const placed = isObject(initial) && isEqual(get(values, place), initial) &&
      isEqualJSON(initialValues, setIn({}, place, initial))
    changed.push({ place, initial: placed ? initial : undefined })
  })
  changed.forEach(outer => {
    const inside = `${dotted(outer.place)}.`
    if (changed.some(({ place, initial }) => initial === undefined && dotted(place).startsWith(inside))) {
      outer.initial = undefined
    }
  })
  return changed.map(({ place, initial }) => ({ place, row: get(next, place), initial }))
}

/**
 * WHAT AN ADD OR A REMOVE LEAVES OF THE ROWS `changedRowsFor` GAVE, ONCE IT HAS ADDED OR REMOVED ITS ROW (2026-10-27).
 *
 * - A row the operation left where it was, and as it was, goes back into `json` as its form started from it
 *   (`initial`), shallowest first, so that an outer row takes the rows inside it along. Its form is handed what it
 *   started from, and keeps what it holds as it did before: its edits, its touched fields, and the errors it shows and
 *   tells the host. Written into the data, they started the form again from it, as one the operation moved or changed
 *   starts.
 * - The form of every other row written measures its changes from what the document's form held of its fields once
 *   they were written (`restartWrittenRows`), as after a submit: the data holds its edits now. Read as they were
 *   written, before the row was added or removed: where each row still was. Most such forms start again from the data
 *   anyway, as their row moved or changed. One handed a moved row that reads as the one it started from does not, and
 *   wrote its edits over that row. A row put back keeps its start, as does each row inside it: the data holds none of
 *   their edits.
 *
 * @param {Object} json - the data the operation rebuilt from the document's form, which this changes
 * @param {Array<ChangedRow>} rows - what `changedRowsFor` gave, shallowest first
 * @param {Object} written - the document's form the rows were written into, and its values once they were
 * @param {Map} forms - the forms of its document tree, `dataFormsOf`
 */
export function settleWrittenRows (json: unknown, rows: ChangedRow[], written: WrittenForm, forms: Forms): void {
  // The places of the rows put back, each as the start of the places inside it.
  const back: string[] = []
  rows.forEach(({ place, row, initial }) => {
    if (initial === undefined || !isEqualJSON(get(json, place), row)) return
    set(json, place, cloneDeep(initial))
    back.push(`${dotted(place)}.`)
  })
  const kept = new Set(rows.map(({ place }) => `${dotted(place)}.`)
    .filter(place => !back.some(outer => place.startsWith(outer))))
  // The rows kept written, and the forms that hold the document from its root, which `restartWrittenRows` reads: the
  // one written as it was then.
  const restarted = new Map<object, RegisteredForm>()
  forms.forEach((entry, key) => {
    // A cast, not a guard: what a form registers as its meta is its document's meta.
    const meta = entry.meta as MetaNode | undefined
    const place = rowPlaceOf(meta)
    if (place) {
      if (kept.has(`${dotted(place)}.`)) restarted.set(key, entry)
    } else if (!(meta && meta.relativePath)) {
      // A cast, not a guard: `restartWrittenRows` reads a document's form for its values only (`documentValuesOf`).
      const then = { getState: () => ({ values: written.values }) } as unknown as FormApi
      restarted.set(key, entry.form.getState === written.form.getState ? { ...entry, form: then } : entry)
    }
  })
  restartWrittenRows(restarted)
}

/**
 * Get raw form values without Select reordering.
 * Used for showIf lookups where array indices must match the original data order.
 */
export const getRawFormsData = (forms: Forms) => {
  return mergeForms(forms, values => values);
}

/**
 * Whether `merged`, a merge `getRawFormsData` gave, holds at each of `names` inside `place` that the table row's own
 * `form` changed what the form holds there: a merge that read those names too would write over it what it holds
 * already, and come out the same. A name whose value the form did not change, it would not write. How a kept merge is
 * checked for the names that came to a row's form after it (`keptRawFormsData`).
 */
export function holdsFields (merged: Values | undefined, form: FormApi, place: string, names: readonly string[]): boolean {
  const inside = namesInside(names, place)
  if (!inside.length) return true
  const { values, initialValues } = form.getState()
  const start = startOf(form, initialValues)
  return inside.every(name => startedWith(values, start, name) || isEqual(getIn(values, name), getIn(merged || {}, name)))
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
 * - Only the values of the fields the form changed are taken (2026-10-27): each name whose value is not the one the
 *   form started with (`changedInside`), read in its values and written at that name over the document's copy of the
 *   row (`writeField`), a value cleared there taken away. Its start is its `initialValues`, moved to what a submit has
 *   written of its values into the document's form (`restartWrittenRows`). The rest of the row is the document's,
 *   which a submit has brought up to the row's form. A `useForm` row's form
 *   starts from the row's values there (`engine/Data.tsx`), and what it leaves alone, another form may have edited,
 *   such as a field in the row's expanded content, of the same name as one its cells show, too. Its fields are every
 *   one it has registered (`fieldNamesOf`), a field a `showIf` has hidden included: final-form keeps its value, as the
 *   document's form keeps a hidden field's. A field that holds an array, as a table's does (`FieldArray`), is written
 *   whole. An add row's form starts from the `initialValues` its meta declares, at the root of its values, where none
 *   of its fields reads, so all it holds at the row is what its user typed.
 * - From 2026-10-26 what the form changed of the row it started from was taken instead, which review found wrong: a
 *   field named `length` was taken for an array's length, an object the row did not start with was written whole,
 *   over a field another form had added to it, and a cleared field took away the object it left empty in the row's
 *   form, with a field another form held in it. Then every field's value was taken, changed or not, and one the cells
 *   only showed wrote the row's value over an edit of the same name in the expanded content. Then a change was
 *   measured from the `initialValues` alone, and an edit set back after a submit gave nothing: the document's copy,
 *   which the submit had written, brought the edit back.
 * - The row goes into the document's own containers. In containers of its own, the row of a table nested
 *   in a row (`dataKind.phases.0.dataKind.lineItems[2]`) made `phases` an object, which the merge put in
 *   place of the document's array of phases.
 * - The rows go last, shallowest first. Forms register as they mount, children first, and `mergeData` finds no
 *   master in a document with one key at its root, so the document's copy of an edited row came last and won. A row
 *   with a form of its own inside another such row goes after it, whose form may hold the array the row is in.
 *
 * @param {Map} forms - the forms to merge, `formsOf` or `dataFormsOf` a document tree
 * @param {Function} fromRoot - what a form that holds the document from its root contributes of its values
 * @returns {Object|undefined} the merged values, or `undefined` when no form contributes any
 */
function mergeForms (forms: Forms, fromRoot: (values: Values, meta: MetaNode | undefined) => Values) {
  const documents: Values[] = [];
  const rows: Array<{ place: string, names: string[], values: Values }> = [];

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
    // Its fields are named `${place}.${name}` (`mapper.tsx`). Only those: a `useForm` row's form starts from the whole
    // row, and an array up to its index, which a copy would walk hole by hole.
    const { values, initialValues } = form.getState();
    const names = changedInside(fieldsOf(form), place, values, startOf(form, initialValues));
    if (names.length) rows.push({ place, names, values });
  })

  const merged = mergeData(documents);
  if (!rows.length) return merged;
  // Each row is set in place, which changes no form: each form's values were cloned before they were merged, and
  // `writeField` copies what it writes into.
  const result: Values = merged || {};
  rows.sort((a, b) => depthOf(a.place) - depthOf(b.place)).forEach(({ place, names, values }) => {
    const row = get(result, place);
    const from = dotted(place).length + 1;
    const written = names.reduce((target: unknown, name) => writeField(target, name.slice(from), getIn(values, name)), row);
    if (written !== row) set(result, place, written);
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
