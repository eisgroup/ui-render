import { createContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import { listenToTreeValues } from '../state/formRegistry'
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

/** What the hook needs of a final-form instance: its subscription to the values. */
type ValuesSubscription = {
    subscribe: (subscriber: (state: { values?: unknown }) => void, subscription: { values: boolean }) => () => void
}

const isSubscribable = (form: unknown): form is ValuesSubscription =>
    typeof form === 'object' && form !== null && typeof (form as { subscribe?: unknown }).subscribe === 'function'

// Before the paint, as a node's other effects that the form hears of. On the server, where no effect runs, an effect:
// a layout effect there only warns.
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Renders the node again when its `showIf`, which reads the form's values at `path` (`formPathOf`), is decided another
 * way than `shown`, the way it rendered, after a change of those values:
 * - in `form`, the form its fields register with, where it is `kept`: its document renders on that form's changes,
 *   but a node in `KeptContent` does not render with it;
 * - in every other form of its document `tree`, wherever it is: its document renders on none of their changes.
 *
 * A decision merges every form of the document with its data, which is not cheap: in a document with a 200-row table,
 * close to half a millisecond. So a change that leaves the value at `path` as it was is not decided again, and costs a
 * lookup: one in another field, which is most of them, and one in a form that holds nothing at `path`. The first call,
 * which final-form makes as the node subscribes to its own form, notes the value the node rendered with. Another form
 * the node has not heard of yet held nothing at `path` as far as it knows: one that registers holding a value there,
 * after the node rendered, is decided again.
 *
 * The latest `shown`, `path` and `decide` are kept for the subscribers from the commit they come from, as a handler
 * reads the latest props. Every node calls this, and one whose `showIf` reads no form runs its effects once, as it
 * mounts, and none as it renders again.
 */
export function useShowIfFollowsForm (
    form: unknown, tree: object | undefined, path: string | undefined, kept: boolean, shown: boolean, decide: () => boolean,
): void {
    const [, renderAgain] = useReducer((renders: number) => renders + 1, 0)
    const subscribed = kept && path !== undefined && isSubscribable(form) ? form : undefined
    const listened = path !== undefined && tree !== undefined ? tree : undefined
    const following = useMemo(() => path !== undefined ? { path, shown, decide } : undefined, [path, shown, decide])
    const latest = useRef(following)
    useBeforePaintEffect(() => {
        if (following) latest.current = following
    }, [following])
    useBeforePaintEffect(() => {
        if (!subscribed) return undefined
        let seen: { value: unknown } | undefined
        return subscribed.subscribe(({ values }) => {
            // Not undefined, and with a path: the effect above kept what the node follows with, in the commit this
            // subscribes in. A node that stops following the form unsubscribes as it commits.
            const { path, shown, decide } = latest.current!
            const value = get(values, path)
            if (seen && Object.is(seen.value, value)) return
            const first = seen === undefined
            seen = { value }
            if (!first && decide() !== shown) renderAgain()
        }, { values: true })
    }, [subscribed])
    useBeforePaintEffect(() => {
        if (!listened) return undefined
        // What each other form held at the path the node reads, as it last told: none, until it tells. Read again from
        // none when `{state.x}` in the name moves the path.
        const seen = new Map<object, unknown>()
        let seenAt: string | undefined
        return listenToTreeValues(listened, (told, values) => {
            // Its own form: its document's render, or the subscription above, follows that one.
            if (told === form) return
            const { path, shown, decide } = latest.current!
            if (path !== seenAt) {
                seen.clear()
                seenAt = path
            }
            const value = values === undefined ? undefined : get(values, path)
            if (Object.is(seen.get(told), value)) return
            if (value === undefined) seen.delete(told)
            else seen.set(told, value)
            if (decide() !== shown) renderAgain()
        })
    }, [listened, form])
}
