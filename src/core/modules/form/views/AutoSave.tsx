import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FormSpy } from 'react-final-form'
import type { FormState, FormSubscription } from 'final-form'
import { PropTypes } from '../../../components'
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

type Values = Record<string, any>

export type AutoSaveProps = {
  /** Saves the values, or only the changed ones with `partial`; a returned promise is awaited */
  onChange: (values: Values) => unknown
  partial?: boolean
  showLoader?: boolean
  subscription?: FormSubscription
  delay?: number
  loadContent?: React.ReactNode
}

/**
 * Final Form Auto Save on Input Value Changes
 * @example:
 *   <AutoSave onChange={console.warn} partial showLoader />
 *
 * A FUNCTION COMPONENT since §9.3 step 6. It was a PureComponent whose
 * `UNSAFE_componentWillReceiveProps` rebuilt the debounce when `delay` changed, cancelling the old
 * one first (§9.3 step 4). It still does:
 *  - the debounce is built once per `delay`, and an effect cancels the one it replaces, and the
 *    last one at unmount. The class cancelled in the lifecycle, before the render; the effect
 *    cancels a commit later, so a save coming due in between would still run;
 *  - a save reads the props of the latest render and the latest baseline when it runs, after any
 *    save still in flight, as the class read `this.props` and `this.state`.
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
  const inFlight = useRef<unknown>(null)
  const latest = useRef<Pick<AutoSaveProps, 'onChange' | 'partial'> | null>(null)
  latest.current = {onChange, partial}

  const handleChange = useMemo(() => debounce(async ({values}: FormState<Values>) => {
    if (baseline.current == null) {
      baseline.current = values
      return
    }

    if (inFlight.current) await inFlight.current
    // Not null: every render sets it, and the first save comes due after a render.
    const {onChange: save, partial: onlyChanges} = latest.current!

    // This diff step is totally optional
    const changes = objChanges(baseline.current, values)
    if (changes) {
      // values have changed
      baseline.current = values
      setSubmitting(true)
      inFlight.current = save(onlyChanges ? changes : values)
      await inFlight.current
      inFlight.current = null
      setSubmitting(false)
    }
  }, delay), [delay])

  useEffect(() => () => handleChange.cancel(), [handleChange])

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

AutoSave.propTypes = {
  // Async Function(values) to call on input changes
  onChange: PropTypes.func.isRequired,
  // Whether to save only changed values, default is all Form values
  partial: PropTypes.bool,
  // Whether to overlay parent container with Loading spinner component
  showLoader: PropTypes.bool,
  // FormSpy subscription
  subscription: PropTypes.object,
  // Milliseconds to delay form `onChange`
  delay: PropTypes.number,
  // Loading message
  loadContent: PropTypes.any,
}

// Memoised because the class was a PureComponent. Its lifecycle compared `delay` by value, so a
// parent render with equal props had nothing to rebuild.
export default React.memo(AutoSave)
