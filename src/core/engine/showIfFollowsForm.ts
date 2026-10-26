import { createContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react'
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
 * It follows the form the node's fields register with, its `form`. A `showIf` that reads another form of the document
 * tree, a nested document's with a form of its own, follows that form's changes where the document renders again with
 * them, as before.
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
 * Renders the node again when its `showIf`, which reads `form`'s values at `path` (`formPathOf`), is decided another
 * way than `shown`, the way it rendered, after a change of those values. Only for a `path`: the node is in
 * `KeptContent`, and its `showIf` reads the form.
 *
 * A decision merges every form of the document with its data, which is not cheap: in a document with a 200-row table,
 * close to half a millisecond. So a change that leaves the value at `path` as it was is not decided again, and costs a
 * lookup: one in another field, which is most of them. The first call, which final-form makes as the node subscribes,
 * notes the value the node rendered with.
 *
 * The latest `shown`, `path` and `decide` are kept for the subscriber from the commit they come from, as a handler
 * reads the latest props. Every node calls this, and one that does not follow the form runs its effects once, as it
 * mounts, and none as it renders again.
 */
export function useShowIfFollowsForm (form: unknown, path: string | undefined, shown: boolean, decide: () => boolean): void {
    const [, renderAgain] = useReducer((renders: number) => renders + 1, 0)
    const subscribed = path !== undefined && isSubscribable(form) ? form : undefined
    const following = useMemo(() => subscribed ? { path, shown, decide } : undefined, [subscribed, path, shown, decide])
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
            const value = get(values, path as string)
            if (seen && Object.is(seen.value, value)) return
            const first = seen === undefined
            seen = { value }
            if (!first && decide() !== shown) renderAgain()
        }, { values: true })
    }, [subscribed])
}
