/**
 * THE MERGE OF A DOCUMENT TREE'S FORMS THAT A `showIf` READS, KEPT (2026-10-26).
 * =============================================================================================
 *
 * A node whose `showIf` reads the form decides by `getRawFormsData` of its document tree (`showIf.ts`), and a merge
 * reads the state of every form of the tree and copies its values. In a table whose rows each hold such a node, every
 * row merged as it rendered, and a mount renders the rows two or three times, so n rows cost about n² copies of a row.
 * Counted on React 18.3, a mount of 20, 40 and 80 rows with a `useForm` form each merged 1260, 4920 and 19440 forms, and
 * a keystroke in a table whose rows share the document's form copied the whole table once per row. Each such row's form
 * holds its row since 2026-10-26 (`engine/Data.tsx`), and every merge writes the values of the fields it changed over
 * the document's copy of the row.
 *
 * So a tree's merge is kept while what the page's forms hold stays the same (`formsChangeCount`): no form registers,
 * goes or registers again, and no form's values change. The count moves before anything else that subscribes to a form
 * hears of a change, so a node that follows the form decides by a merge that holds it.
 *
 * A merge reads a row's form by its fields' names too, every one the form has registered (`fieldNamesOf`, 2026-10-27).
 * A name that comes is no change of what the forms hold (`fieldNamesCount`): the field registers with the value its
 * row's form holds, which a merge writes only where the form changed it, mostly not before the field came. So where
 * names came, the merge is kept if it holds what each of them would write (`holdsFields`), and made again if not.
 * Counted as a change, every burst of registrations would merge again, a mount among them: the mount's second merge
 * comes as its nodes commit, before their fields register.
 *
 * Where more than one form holds the whole document (`wholeDocument`), such as a `useForm` block's that selects no values
 * beside the document's own, each of them gives a merge the fields it changed the same way (`mergeDocuments`,
 * 2026-10-27), and the names that come to them are checked the same way, with `''` for a place.
 *
 * What is kept is what a merge would give. The values are shared between the calls that get them: read them, do not
 * change them.
 */
import { fieldNamesCount, fieldNamesOf } from '../modules/form/batchedForm'
import { formsChangeCount, formsOf, type RegisteredForm } from '../state/formRegistry'
import { getRawFormsData, holdsFields, rowPlaceOf, type MetaNode } from './formData'

/** A form's values, or a merge of several. */
type Values = Record<string, any>

/**
 * A table row with a form of its own, as a kept merge read it: where the row is, and the names its form had. Or a form
 * that holds the whole document, where another does too, whose place is `''`.
 */
type KeptRow = { form: RegisteredForm['form'], place: string, names: readonly string[] }

/** A tree's merge, with the counts it was made at and the rows it read. */
type Kept = { changes: number, names: number, values: Values | undefined, rows: KeptRow[] }

const kept = new WeakMap<object, Kept>()

/** `getRawFormsData` of the forms of `tree` (`formsOf`), merged once while they hold the same. */
export function keptRawFormsData (tree: object | undefined): Values | undefined {
    // No tree, no forms: `formsOf` finds none.
    if (tree === undefined) return undefined
    const changes = formsChangeCount()
    const last = kept.get(tree)
    if (last && last.changes === changes && namesLeaveIt(last)) return last.values
    const forms = formsOf(tree)
    const values = getRawFormsData(forms)
    kept.set(tree, { changes, names: fieldNamesCount(), values, rows: rowsOf(forms) })
    return values
}

/**
 * The table rows with a form of their own among `forms`, and the names each form has registered; and the forms that
 * hold the document from its root, where there is more than one.
 */
function rowsOf (forms: Map<object, RegisteredForm>): KeptRow[] {
    const rows: KeptRow[] = []
    const documents: KeptRow[] = []
    forms.forEach(({ form, meta, wholeDocument }) => {
        // A cast, not a guard: what a form registers as its meta is its document's meta.
        const place = rowPlaceOf(meta as MetaNode | undefined)
        const names = fieldNamesOf(form)
        if (!names) return
        if (place) rows.push({ form, place, names })
        else if (wholeDocument === true) documents.push({ form, place: '', names })
    })
    return documents.length > 1 ? [...documents, ...rows] : rows
}

/**
 * Whether the names that came to the forms since `last` was merged leave the merge as it is: every one that came to a
 * row's form holds there what the merge holds. Where they do, the names are noted, and not checked again.
 */
function namesLeaveIt (last: Kept): boolean {
    const count = fieldNamesCount()
    if (last.names === count) return true
    // Not undefined: a row is kept only for a form that names its fields. A list read before is the start of this one.
    const now = last.rows.map(row => fieldNamesOf(row.form)!)
    const leaves = last.rows.every((row, i) =>
        now[i] === row.names || holdsFields(last.values, row.form, row.place, now[i].slice(row.names.length)))
    if (!leaves) return false
    last.rows.forEach((row, i) => { row.names = now[i] })
    last.names = count
    return true
}
