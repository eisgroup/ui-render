/**
 * WHAT A DOCUMENT'S META READS FROM ITS STATE (2026-10-12).
 * =============================================================================================
 *
 * A document builds its meta from its state (`meta` in `rules.tsx`) and kept it for one state object
 * only. Every new state, whatever it changed, built the whole meta anew, and every field that takes an
 * object or a function as a prop rendered again. Two writes made that common. A named Select with no
 * `onChange` of its own writes its value into the state, since `toOpenLConfig` gives it
 * `setState,<name>`. The form layer writes `canSave` there on the first edit. So each pick in such a
 * Select, and the first edit, rendered every Select of the document.
 *
 * Building the meta reads the state in three ways, and only these:
 * - **Templates.** The `{…}` templates in a node's `name` are resolved against the instance, including
 *   the `name` of a value definition such as `options: {name: …}`. `{state.x}` reads `state.x`, and
 *   `{data.x}` reads the document's data (`state.data`).
 * - **The currency** (`state.currencyCode`), for a `Currency` renderer.
 * - **Seeding.** `initSelectStatesFromData` checks whether a Select's state is empty yet, to seed it.
 *
 * So a meta is kept while the state holds:
 * - the same meta and data;
 * - the same currency;
 * - the same value under each key a template reads;
 * - the same emptiness under each key a Select seeds.
 *
 * A template that reads anything else of the instance, or the whole state, keeps the old rule: every
 * new state builds the meta anew.
 */
import { FIELD } from '../modules/variables'

/** What a meta reads from its document's state, besides its meta, its data and its currency. */
export type MetaStateReads = {
    /** The state's keys a `{state.x}` template reads: their values matter */
    keys: string[]
    /** The keys `initSelectStatesFromData` seeds: only whether they are empty matters */
    seeded: string[]
}

const TEMPLATE = /{([^{}]+)}/g

/** Template roots that are not the instance's: a row's index and value, and a handler's arguments. */
const NOT_THE_INSTANCE = /^(index|value|\d+)$/

/** What `meta`, as `toOpenLConfig` leaves it, reads from its document's state, or `undefined` when it may read anything there. */
export function stateReadsOf (meta: unknown): MetaStateReads | undefined {
    const keys = new Set<string>()
    const seeded = new Set<string>()
    let anything = false

    const readTemplates = (name: string) => {
        name.replace(TEMPLATE, (template: string, match: string) => {
            // As `interpolateString` reads it: a path, then after a comma a fallback.
            const [root, key] = match.split(',')[0].split(/[.[\]]+/)
            if (root === 'state' && key) keys.add(key)
            else if (root !== 'data' && !NOT_THE_INSTANCE.test(root)) anything = true
            return template
        })
    }

    const visit = (node: unknown): void => {
        if (anything || node === null || typeof node !== 'object') return
        if (Array.isArray(node)) {
            node.forEach(visit)
            return
        }
        const record = node as Record<string, unknown>
        const { name, view, onChange } = record
        if (typeof name === 'string') {
            readTemplates(name)
            const isSelect = view === FIELD.TYPE.SELECT || view === FIELD.TYPE.DROPDOWN
            if (isSelect && typeof onChange === 'string' && onChange.indexOf(FIELD.ACTION.SET_STATE) === 0) seeded.add(name)
        }
        for (const attribute in record) {
            // A nested document's meta is built by that document, against its own state.
            if (attribute !== 'meta') visit(record[attribute])
        }
    }

    visit(meta)
    return anything ? undefined : { keys: [...keys], seeded: [...seeded] }
}

/** Whether a new state leaves everything a meta read from the previous one as it was. */
export function readsUnchanged (reads: MetaStateReads, before: Record<string, any>, after: Record<string, any>): boolean {
    return before.meta === after.meta
        && before.data === after.data
        && Object.is(before.currencyCode, after.currencyCode)
        && reads.keys.every(key => Object.is(before[key], after[key]))
        && reads.seeded.every(key => (before[key] == null) === (after[key] == null))
}
