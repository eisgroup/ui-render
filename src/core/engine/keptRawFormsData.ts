/**
 * THE MERGE OF A DOCUMENT TREE'S FORMS THAT A `showIf` READS, KEPT (2026-10-26).
 * =============================================================================================
 *
 * A node whose `showIf` reads the form decides by `getRawFormsData` of its document tree (`showIf.ts`), and a merge
 * reads the state of every form of the tree and copies its values. In a table whose rows each hold such a node, every
 * row merged as it rendered, and a mount renders the rows two or three times, so n rows cost about n² copies of a row.
 * Counted on React 18.3, a mount of 20, 40 and 80 rows with a `useForm` form each merged 1260, 4920 and 19440 forms, and
 * a keystroke in a table whose rows share the document's form copied the whole table once per row. Each such row's form
 * holds its row since 2026-10-26 (`engine/Data.tsx`), and every merge writes it over the document's copy.
 *
 * So a tree's merge is kept while what the page's forms hold stays the same (`formsChangeCount`): no form registers,
 * goes or registers again, and no form's values change. The count moves before anything else that subscribes to a form
 * hears of a change, so a node that follows the form decides by a merge that holds it.
 *
 * What is kept is what a merge would give. The values are shared between the calls that get them: read them, do not
 * change them.
 */
import { formsChangeCount, formsOf } from '../state/formRegistry'
import { getRawFormsData } from './formData'

/** A form's values, or a merge of several. */
type Values = Record<string, any>

const kept = new WeakMap<object, { changes: number, values: Values | undefined }>()

/** `getRawFormsData` of the forms of `tree` (`formsOf`), merged once while they hold the same. */
export function keptRawFormsData (tree: object | undefined): Values | undefined {
    // No tree, no forms: `formsOf` finds none.
    if (tree === undefined) return undefined
    const changes = formsChangeCount()
    const last = kept.get(tree)
    if (last && last.changes === changes) return last.values
    const values = getRawFormsData(formsOf(tree))
    kept.set(tree, { changes, values })
    return values
}
