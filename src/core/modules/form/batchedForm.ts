import { createForm } from 'final-form'
import type { Config, FormApi } from 'final-form'

/**
 * Brackets around a burst of fields registering and unregistering, which an engine node opens in its layout effect
 * and closes in its passive effect (`RenderComponent` in `engine/mapper.tsx`), on mount and when its `showIf` flips,
 * through `useBracket` (`components/useBracket.ts`). Brackets nest. The outermost one pauses validation when nothing
 * else has, and resumes it when it closes.
 */
export type Registrations = { begin: () => void, end: () => void }

const REGISTRATIONS = Symbol('registrations')

/**
 * The brackets of a form `createBatchedForm` made, or of a copy of one, which react-final-form hands out on every
 * render: a copy has the instance's own properties, this one among them. Undefined for any other form.
 */
export function registrationsOf (form: unknown): Registrations | undefined {
  return form ? (form as {[REGISTRATIONS]?: Registrations})[REGISTRATIONS] : undefined
}

/**
 * The final-form instance a document's `<Form>` renders, whose fields hear of each other once per burst of
 * registrations rather than once per field (2026-10-13).
 *
 * WHY. A `registerField` that is not `silent` publishes the state of every field registered before it, and, with
 * a validator, validates every field. A burst of n fields therefore computed about n²/2 field states, and ran
 * about n²/2 validators. Unregistering does the same in reverse. Measured in Chromium, a 200-row table of two
 * fields per row spent about 100 ms of its 215 ms mount in final-form's `notifyFieldListeners` and
 * `subscriptionFilter`, and a tab switch to that table took about 240 ms, and one away from it about as long.
 *
 * HOW. While validation is paused, a field registers `silent`: final-form then publishes the field's own state to
 * it, which react-final-form takes as the field's initial state, and tells nobody else. When validation resumes,
 * every field is told once: `resumeValidation` validates and publishes when a validator was held back, and `batch`
 * publishes when none was, so that an earlier field hears what a later field's default value did to it. Two
 * things pause validation:
 *  - react-final-form, from the moment it creates the form to its first effect, which covers the first render;
 *  - the outermost bracket of `registrationsOf`, which covers what mounts later, a tab or a popup or a row, and
 *    what goes in the same commit.
 *
 * UNREGISTERING. final-form keeps a field's `silent` for its unregistering too, which would then tell nobody that
 * the field and its validator are gone. So such a field unregisters as one that is not silent does: with a
 * validator, every field is validated again and every listener told, as `setConfig('validate', …)` does; without
 * one, the form's listeners are told when it was the last field of its name. While validation is paused, that is
 * held until it resumes, and done once for all the fields that went.
 *
 * A registration that asks to be silent itself, as react-final-form's probe in a field's first render does, keeps
 * its `silent`, and while validation runs, it registers without its validator (see below). Every other registration
 * made while validation runs is left as it is.
 */
export function createBatchedForm<FormValues = Record<string, any>> (config: Config<FormValues>): FormApi<FormValues> {
  const form = createForm<FormValues>(config)
  const {registerField, resumeValidation, setConfig, submit} = form
  // The form's own validator, which `setConfig('validate', …)` keeps and validates every field with.
  let validate = config.validate
  // A field registered silently since validation was paused, which the others have not heard of yet.
  let unheard = false
  // What the fields that went while validation was paused left untold: a validator, or the last field of a name.
  let revalidate = false
  let retell = false
  // The brackets open, and whether the outermost one paused validation itself.
  let depth = 0
  let pausedHere = false

  /** Tells every field and the form's listeners, once, what the fields that came and went left untold. */
  const settle = () => {
    const again = revalidate
    const tell = unheard || retell
    unheard = revalidate = retell = false
    if (again) setConfig('validate', validate)
    else if (tell) form.batch(() => undefined)
  }

  form.setConfig = (name, value) => {
    // A cast, not a guard: `value` is the option `name` names, which the checker cannot narrow by `name`.
    if (name === 'validate') validate = value as Config<FormValues>['validate']
    setConfig(name, value)
  }
  form.registerField = (name, subscriber, subscription, fieldConfig) => {
    if (fieldConfig?.silent) {
      // react-final-form's probe in a field's first render, registered and unregistered at once for the state the
      // field first renders with. With a validator and validation running, final-form validated every field for
      // it: a burst of n fields mounting beside m others ran about n·m validators before any bracket opened, since
      // the probe runs in render. Without one, the field first renders with no error yet, as every field does on a
      // document's first render, where react-final-form has validation paused. Its error comes when its node's
      // bracket closes. That bracket matters: react-final-form takes the first notification after the field's
      // registration from its effect as the state the probe gave it, so that registration must not validate.
      // Inside a bracket it registers silently, and the error comes in a later notification. Without the
      // brackets, a field the user touched came back from a tab switch without its error, as the tab-switch test
      // of `UIRender.form-flows.test.js` shows.
      if (form.isValidationPaused()) return registerField(name, subscriber, subscription, fieldConfig)
      return registerField(name, subscriber, subscription, {...fieldConfig, getValidator: undefined})
    }
    if (!form.isValidationPaused()) return registerField(name, subscriber, subscription, fieldConfig)
    unheard = true
    const unregister = registerField(name, subscriber, subscription, {...fieldConfig, silent: true})
    return () => {
      const validated = !!fieldConfig?.getValidator?.()
      unregister()
      const gone = form.getFieldState(name) === undefined
      if (form.isValidationPaused()) {
        revalidate ||= validated
        retell ||= gone
      } else if (validated) setConfig('validate', validate)
      else if (gone) form.batch(() => undefined)
    }
  }
  form.resumeValidation = () => {
    resumeValidation()
    settle()
  }
  form.submit = () => {
    // A submit between a commit and its effects, inside a bracket, submits what has registered so far validated.
    if (pausedHere) {
      resumeValidation()
      form.pauseValidation()
    }
    return submit()
  }

  const registrations: Registrations = {
    begin () {
      depth += 1
      if (depth > 1 || form.isValidationPaused()) return
      pausedHere = true
      form.pauseValidation()
    },
    end () {
      if (depth === 0) return
      depth -= 1
      // A pause something else made is resumed by it, through `resumeValidation` above, which settles.
      if (depth > 0 || !pausedHere) return
      pausedHere = false
      form.resumeValidation()
    },
  }
  Object.assign(form, {[REGISTRATIONS]: registrations})
  return form
}
