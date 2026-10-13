import { createForm } from 'final-form'
import type { Config, FormApi } from 'final-form'

/**
 * The final-form instance a document's `<Form>` renders, whose first render's fields hear of each other once
 * (2026-10-13).
 *
 * react-final-form pauses validation when it creates a form, and resumes it in its first effect, by which time
 * every field of the first render has registered. The pause holds back validation and the form's listeners, but
 * not the fields': a `registerField` that is not `silent` publishes the state of every field registered before it.
 * A document of n fields therefore published about n²/2 field states as it mounted. Measured in Chromium, a
 * 200-row table of two fields per row spent about 100 ms of its 215 ms mount there: final-form's
 * `notifyFieldListeners` and `subscriptionFilter`, reached from react-final-form's `register`.
 *
 * While validation is paused, a field registers `silent`. final-form then publishes the field's own state to it,
 * which react-final-form takes as the field's initial state, and tells nobody else. When validation resumes,
 * `batch` publishes every field's state and the form's, once, so each listener ends with what it would have had.
 * `resumeValidation` publishes them too when a validator was held back, so that pass finds nothing left to tell;
 * when none was, it publishes nothing, and the fields would not hear what a later field's default value changed.
 *
 * final-form keeps a field's `silent` for its unregistering too, which would then tell nobody that the field and
 * its validator are gone. So such a field unregisters as one that is not silent does: with a validator, every field
 * is validated again and every listener told, as `setConfig('validate', …)` does; without one, the form's listeners
 * are told when it was the last field of its name.
 *
 * A registration that asks to be silent itself, as react-final-form's probe in a field's first render does, is
 * left as it is. So is every registration made while validation runs.
 */
export function createBatchedForm<FormValues = Record<string, any>> (config: Config<FormValues>): FormApi<FormValues> {
  const form = createForm<FormValues>(config)
  const {registerField, resumeValidation, setConfig} = form
  // The form's own validator, which `setConfig('validate', …)` keeps and validates every field with.
  let validate = config.validate
  // A field registered silently since validation was paused, which the others have not heard of yet.
  let unheard = false
  form.setConfig = (name, value) => {
    // A cast, not a guard: `value` is the option `name` names, which the checker cannot narrow by `name`.
    if (name === 'validate') validate = value as Config<FormValues>['validate']
    setConfig(name, value)
  }
  form.registerField = (name, subscriber, subscription, fieldConfig) => {
    if (!form.isValidationPaused() || fieldConfig?.silent) return registerField(name, subscriber, subscription, fieldConfig)
    unheard = true
    const unregister = registerField(name, subscriber, subscription, {...fieldConfig, silent: true})
    return () => {
      const validated = !!fieldConfig?.getValidator?.()
      unregister()
      if (validated) setConfig('validate', validate)
      else if (form.getFieldState(name) === undefined) form.batch(() => undefined)
    }
  }
  form.resumeValidation = () => {
    resumeValidation()
    if (!unheard) return
    unheard = false
    form.batch(() => undefined)
  }
  return form
}
