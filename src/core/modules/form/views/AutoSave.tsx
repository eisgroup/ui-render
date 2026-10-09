import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FormSpy } from 'react-final-form'
import type { FormState, FormSubscription } from 'final-form'
import { Loading } from '../../../components/Loading'
import { debounce, l, localiseTranslation, objChanges, TIME_DURATION_INSTANT } from '../../../utils'
import { _ } from '../../../utils/translations'

localiseTranslation({
  SYNCING___: {
    [l.ENGLISH]: 'Syncing...',
  },
})

// One object, as the class's `defaultProps` held one: FormSpy is handed the same subscription on
// every render rather than a new default each time.
const VALUES_ONLY: FormSubscription = {values: true}

/**
 * `useLayoutEffect` in a browser, so a save reads the props of the last commit before anything can change
 * a value, and `useEffect` on the server, where nothing saves and React 16 and 17 warn about a layout effect.
 */
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Whether React warns when a component that has unmounted updates its state: 16 and 17 do, 18 dropped the
 * warning. A save finishing after the component has gone is the case, and only these need to skip the update.
 * React 19's `<Activity>` runs an effect's cleanup for a component it only HIDES, whose loader must still
 * follow the save, so a "mounted" flag from an effect cannot be trusted there.
 */
const WARNS_ON_UNMOUNTED_UPDATE = Number(String(React.version).split('.')[0]) < 18

type Values = Record<string, any>

export type AutoSaveProps = {
  /** Saves the values, or only the changed ones with `partial`; a returned promise is awaited */
  onChange: (values: Values) => unknown
  /** Whether to save only changed values, default is all Form values */
  partial?: boolean
  /** Whether to overlay parent container with Loading spinner component */
  showLoader?: boolean
  /** FormSpy subscription */
  subscription?: FormSubscription
  /** Milliseconds to delay form `onChange` */
  delay?: number
  /** Loading message */
  loadContent?: React.ReactNode
}

/**
 * Final Form Auto Save on Input Value Changes
 * @example:
 *   <AutoSave onChange={console.warn} partial showLoader />
 *
 * A FUNCTION COMPONENT since §9.3 step 6. It was a PureComponent whose
 * `UNSAFE_componentWillReceiveProps` rebuilt the debounce when `delay` changed, cancelling the old
 * one first (§9.3 step 4). Now:
 *  - the debounce is built once per `delay`, and an effect FLUSHES the one it replaces, and the last
 *    one at unmount: a change still waiting is saved then, not dropped. Until 2026-10-09 it was
 *    cancelled, so the last edit before the user left was lost. 0.34.x saved it when the delay ran
 *    out, after the component had gone, with a state update on it; this saves it as it goes, and
 *    updates no state once it has;
 *  - a save reads the props of the latest render and the latest baseline when it runs, after any
 *    save still in flight, as the class read `this.props` and `this.state`. One save at a time: a
 *    second change waiting for the same save used to start alongside the first that woke;
 *  - a save that fails (its promise rejects) is not the end: the next change saves again, from the
 *    baseline before the failed one, so a `partial` save still sends what failed. The class, and the
 *    first version of this component, left the failed promise in flight: every later save awaited it,
 *    rejected with it, and nothing was saved again, with the loader on for good. The failure is the
 *    host's to report, from the save that failed; here it is caught, not passed on as an unhandled
 *    rejection that nothing can act on.
 * The baseline values and the save in flight are refs, since nothing renders them; the class kept
 * the values in state and the promise on the instance. Only `submitting` is state.
 */
function AutoSave ({
  onChange,
  partial,
  showLoader,
  subscription = VALUES_ONLY,
  delay = TIME_DURATION_INSTANT,
  loadContent,
}: AutoSaveProps) {
  const [submitting, setSubmitting] = useState(false)
  const baseline = useRef<Values | undefined>(undefined)
  const inFlight = useRef<Promise<unknown> | null>(null)
  // Whether the component is mounted, for the React versions that warn about an update after unmount.
  const mounted = useRef(false)
  // What a save reads when it comes due, assigned after each commit rather than during the render.
  const latest = useRef<Pick<AutoSaveProps, 'onChange' | 'partial'> | null>(null)
  useBeforePaintEffect(() => {
    latest.current = {onChange, partial}
  })

  // `react-hooks/refs` assumes a function handed a callback during the render may call it then. `debounce` only
  // wraps it: the callback runs from a timer, after the render, which is where reading the refs is allowed.
  // eslint-disable-next-line react-hooks/refs
  const handleChange = useMemo(() => debounce(async ({values}: FormState<Values>) => {
    if (baseline.current == null) {
      baseline.current = values
      return
    }

    // Wait for a save still running, whether it succeeds or fails: the one that made it deals with that.
    // Until none is: two changes waiting for the same save used to wake together and save at once, and
    // the older one could reach the server last. 0.34.x had the same single check.
    while (inFlight.current) await inFlight.current.catch(() => undefined)
    // Not null: every render sets it, and the first save comes due after a render.
    const {onChange: save, partial: onlyChanges} = latest.current!

    // This diff step is totally optional
    const changes = objChanges(baseline.current, values)
    if (changes) {
      // values have changed
      const before = baseline.current
      baseline.current = values
      const showSubmitting = (value: boolean) => {
        if (mounted.current || !WARNS_ON_UNMOUNTED_UPDATE) setSubmitting(value)
      }
      showSubmitting(true)
      // A save that throws rather than rejecting fails the same way.
      const saving = new Promise<unknown>(resolve => resolve(save(onlyChanges ? changes : values)))
      inFlight.current = saving
      try {
        await saving
      } catch {
        // Not saved: the next change compares with what was saved before, so it sends this again.
        baseline.current = before
      } finally {
        // This save's: no other can start while it runs (the wait above).
        inFlight.current = null
        showSubmitting(false)
      }
    }
  }, delay), [delay])

  // Before the flush below, so that its cleanup has run when an unmount flushes. Its own, so that a new
  // `delay`, which flushes too, does not count as an unmount.
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => () => handleChange.flush(), [handleChange])

  // This is not the only way to accomplish auto-save, but it does let us:
  // - Use built-in React lifecycle methods to listen for changes
  // - Maintain state of when we are submitting
  // - Render a message when submitting
  // - Pass in delay and save props nicely
  // This component doesn't have to render anything, but it can render submitting state.
  return <>
    {/* FormSpy onChange will be called once on component mount */}
    <FormSpy subscription={subscription} onChange={handleChange}/>
    {showLoader && submitting ? <Loading loading>{loadContent || _.SYNCING___}</Loading> : null}
  </>
}

// Memoised because the class was a PureComponent. Its lifecycle compared `delay` by value, so a
// parent render with equal props had nothing to rebuild.
export default React.memo(AutoSave)
