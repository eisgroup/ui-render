import { createContext, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import { listenToTreeValues, treeValuesTellsSince, type TreeValuesTell } from '../state/formRegistry'
import { get } from '../utils/object'

/**
 * A `showIf` THAT READS THE FORM, WHERE ITS DOCUMENT'S RENDER DOES NOT REACH (2026-10-23).
 * =============================================================================================
 *
 * A node's `showIf` is decided when the node renders (`shouldRender`, `showIf.ts`), and an object `showIf` with a
 * `name` reads the form's values. A node renders with its document, which renders on every change of its form, so
 * such a `showIf` follows the form. Not everywhere: a `List`, an `ExpandList` and a `TabList` render their items only
 * when their own props change, which a change of the form does not do, and a popup shows the element it was opened
 * with. Such a node's `showIf` stayed as it was. Every node rendered again on each render of a host until 2026-10-23,
 * through a context `AppProvider` made anew each time: a host that renders again on `onDataChanged` saw such a node
 * show, and not hide again where the change left the form as it started, which `onDataChanged` is not told of.
 *
 * So the mapper says, through `KeptContent`, which nodes render in such a container, and such a node whose `showIf`
 * reads the form follows the form's values itself (`useShowIfFollowsForm`). A node outside them renders with its
 * document, as before, and costs nothing more.
 *
 * THE OTHER FORMS OF THE TREE (2026-10-26). A document renders on changes of its own form only, and a `Data` block
 * with `useForm`, a table row with one, and a table's add row each have a form of their own. A node whose `showIf`
 * reads a field of such a form, from outside it, rendered on none of its changes: one beside a `useForm` block that
 * reads the block's field, and one in another block. Measured on the published 0.34.3, on React 16.14 and 18.3, it
 * followed the field for a host that renders again on `onDataChanged`, through the context above, and never for a
 * host that renders once. From 2026-10-23 it never followed it. So every node whose `showIf` reads the form follows
 * the other forms of its document tree too, wherever it is: the form layer tells the tree each form's values
 * (`tellTreeValues`, `state/formRegistry`), and a change of the value the `showIf` reads decides it again.
 */
export const KeptContent = createContext(false)

/** What a node decides its `showIf` by (`shouldRender`): whether it shows, and the value it read in the forms. */
export type ShowIfDecision = { shown: boolean, value: unknown }

/** What the hook needs of a final-form instance: its subscription to the values. */
type ValuesSubscription = {
    subscribe: (subscriber: (state: { values?: unknown }) => void, subscription: { values: boolean }) => () => void
}

const isSubscribable = (form: unknown): form is ValuesSubscription =>
    typeof form === 'object' && form !== null && typeof (form as { subscribe?: unknown }).subscribe === 'function'

// Before the paint, as a node's other effects that the form hears of. On the server, where no effect runs, an effect:
// a layout effect there only warns.
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const valueAt = (values: unknown, path: string) => values === undefined ? undefined : get(values, path)

/** A change of a form's values, as against a form that registers or goes. */
const isValueChange = (tell: TreeValuesTell) => tell.previous !== undefined && tell.values !== undefined

/**
 * How many times a node renders again on forms that come and go, between two changes of its tree's values. A form that
 * comes and goes with the node itself would flip it for ever: a `useForm` block under it whose values merge over the
 * field its `showIf` reads, and decide it the other way, comes as the node shows and hides it, and goes as it hides and
 * shows it. Measured, React gives up with "Maximum update depth exceeded". The node stops there, and stays as it is
 * until a value of its tree changes. Each coming or going counts up to twice: as the node hears it, and as it commits.
 */
const COMINGS_AND_GOINGS = 4

/**
 * Whether `tell`, from another form than `own`, can change a decision that read `value` at `path`: that form's value
 * there changed, to another than `value`. One that ends at `value` leaves the merge of the forms as it was, and so does
 * a change in a form that holds nothing there, which is most of them.
 */
const moves = (tell: TreeValuesTell, own: unknown, path: string, value: unknown) => {
    if (tell.form === own) return false
    const after = valueAt(tell.values, path)
    return !Object.is(valueAt(tell.previous, path), after) && !Object.is(after, value)
}

/**
 * Renders the node again when its `showIf`, which reads the form's values at `path` (`formPathOf`), is decided another
 * way than it rendered, after a change of those values:
 * - in `form`, the form its fields register with, where it is `kept`: its document renders on that form's changes,
 *   but a node in `KeptContent` does not render with it;
 * - in every other form of its document `tree`, wherever it is: its document renders on none of their changes.
 *
 * A decision merges every form of the document with its data, which is not cheap: in a document with a 200-row table,
 * close to half a millisecond. So a change that leaves the value at `path` as it was, or that makes it the value the
 * node decided by, is not decided again, and costs a lookup. The node decided by `rendered`, read as it rendered, and
 * then by any decision it makes here. The tells its tree made after `renderedAt`, the count of tells as it rendered,
 * reached the node with the decision of its last render, or, as it mounted, not at all: it catches up with them as it
 * commits.
 *
 * The latest `path` and `decide` are kept for the subscribers from the commit they come from, as a handler reads the
 * latest props. Every node calls this, and one whose `showIf` reads no form runs its effects once, as it mounts, and
 * none as it renders again.
 */
export function useShowIfFollowsForm (
    form: unknown, tree: object | undefined, kept: boolean, path: string | undefined,
    rendered: ShowIfDecision, renderedAt: number, decide: () => ShowIfDecision,
): void {
    const [, renderAgain] = useReducer((renders: number) => renders + 1, 0)
    const subscribed = kept && path !== undefined && isSubscribable(form) ? form : undefined
    const listened = path !== undefined && tree !== undefined ? tree : undefined
    const { shown, value } = rendered
    const following = useMemo(
        () => path !== undefined ? { path, shown, value, renderedAt, decide } : undefined,
        [path, shown, value, renderedAt, decide],
    )
    const latest = useRef(following)
    const decided = useRef<ShowIfDecision>(rendered)
    // Renders again on forms that came or went, since a value of the tree last changed (`COMINGS_AND_GOINGS`).
    const flips = useRef(0)
    // Decides again, by the latest render's `decide`, and renders the node again where the answer is another.
    const decideAgain = useCallback((byValues: boolean) => {
        const was = decided.current
        const next = latest.current!.decide() // not undefined: only a node with a path listens
        if (next.shown !== was.shown && !byValues) {
            flips.current += 1
            if (flips.current > COMINGS_AND_GOINGS) return
        }
        decided.current = next
        if (next.shown !== was.shown) renderAgain()
    }, [])
    useBeforePaintEffect(() => {
        if (!following) return
        latest.current = following
        decided.current = { shown: following.shown, value: following.value }
        if (!listened) return
        const tells = treeValuesTellsSince(listened, following.renderedAt)
        if (!tells) {
            // Gone from the log: they were made in an earlier task, and the node decides again.
            decideAgain(true)
            return
        }
        if (tells.some(isValueChange)) flips.current = 0
        const moving = tells.filter(tell => moves(tell, form, following.path, following.value))
        if (moving.length) decideAgain(moving.some(isValueChange))
    }, [following, listened, form, decideAgain])
    useBeforePaintEffect(() => {
        if (!subscribed) return undefined
        let seen: { path: string, value: unknown } | undefined
        return subscribed.subscribe(({ values }) => {
            const { path } = latest.current! // not undefined: the effect above kept it, in the commit this subscribes in
            const now = valueAt(values, path)
            // final-form's first call, as the node subscribes, notes the value the node rendered with.
            const first = seen === undefined
            if (seen && seen.path === path && Object.is(seen.value, now)) return
            seen = { path, value: now }
            if (!first && !Object.is(now, decided.current.value)) decideAgain(true)
        }, { values: true })
    }, [subscribed, decideAgain])
    useBeforePaintEffect(() => {
        if (!listened) return undefined
        return listenToTreeValues(listened, tell => {
            const byValues = isValueChange(tell)
            if (byValues) flips.current = 0
            if (moves(tell, form, latest.current!.path, decided.current.value)) decideAgain(byValues)
        })
    }, [listened, form, decideAgain])
}
