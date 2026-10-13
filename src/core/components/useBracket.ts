import { useEffect, useLayoutEffect, useRef } from 'react'

// A layout effect in a browser. On the server, where no effect runs, an effect: React 16 and 17 warn about a layout
// effect there.
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Brackets around what a commit mounts and unmounts in its passive effects. They nest. */
export type Bracket = { begin: () => void, end: () => void }

/**
 * Opens `bracket` in a layout effect and closes it in a passive effect, on mount and when `bracket` or `key`
 * changes. A commit runs its passive effects after its layout effects, so what mounts or goes in them comes between,
 * as fields that register with a form and unregister do (`registrationsOf`, `modules/form/batchedForm.ts`).
 *
 * A Suspense boundary that hid the component and shows it again runs its layout effects again, and not its passive
 * ones, on React 18 and 19. Until 2026-10-14 a bracket opened then all the same, and nothing closed it: the form kept
 * validation paused for good, and a required field emptied after that showed no error. So the layout effect opens a
 * bracket only for a `bracket` and `key` that no passive effect has closed one for since it last ran.
 * StrictMode's second mount in development cleans the passive effect up and runs it again, so it is bracketed.
 *
 * @param bracket - what to open and close; nothing, for a component outside any form
 * @param key - what, when it changes, mounts or removes what the bracket is for: whether a node is shown, or a popup open
 */
export function useBracket (bracket: Bracket | undefined, key: unknown): void {
  // The `bracket` and `key` the passive effect closed a bracket for, until that effect is cleaned up.
  const closed = useRef<{ bracket: Bracket | undefined, key: unknown } | null>(null)
  useBeforePaintEffect(() => {
    const last = closed.current
    if (last !== null && last.bracket === bracket && Object.is(last.key, key)) return
    bracket?.begin()
  }, [bracket, key])
  useEffect(() => {
    bracket?.end()
    closed.current = { bracket, key }
    return () => { closed.current = null }
  }, [bracket, key])
}
