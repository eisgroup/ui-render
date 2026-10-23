/**
 * HOW THE ENGINE MAPS VALIDATION ERRORS: which of a form's errors are shown (a touched field's, or
 * one the form remembers as touched), the shape `getValidationErrors` hands a host, and whether a
 * field shows one that holds an `onApplyPeriods` back.
 *
 * It was part of `engine/utils.ts` until §9.9-H6, which dissolved that file into `formData.ts`,
 * `errorMapping.ts` and `dataMapping.ts`.
 */
import type { FormApi } from 'final-form'
import { errorsFor, fixableFieldsOf, touchedFor } from '../state/formRegistry'
import type { RegisteredForm } from '../state/formRegistry'
import type { MetaNode } from './formData'

function getKeyAndPathFromMetaData(meta: MetaNode): { key?: string, path?: string } {
  const { relativeIndex, relativePath } = meta;
  let path = '';
  let key = 'master';

  if (relativePath && typeof relativeIndex === 'undefined') {
    return {};
  }

  if (relativePath) {
    path = `${relativePath}[${relativeIndex}].`;
    key = path;
  }

  return { key, path }
}

export function errorsProcessing(form: FormApi, meta: MetaNode) {
  const { key } = getKeyAndPathFromMetaData(meta);

  if (!key) {
    return;
  }

  const registeredFieldNames = form.getRegisteredFields()
  if (!registeredFieldNames.length) {
    return;
  }

  // This form's errors, not everyone's: the map used to be shared, so a second document on the
  // same page reported the first one's errors as its own.
  const errorsMap = errorsFor(form)
  const rememberedTouched = touchedFor(form)

  registeredFieldNames.forEach(field => {
    // Not undefined: the field was just listed as registered.
    const { name, error, touched } = form.getFieldState(field)!;

    if (error && (touched || rememberedTouched[name])) {
      let errorText = error;
      if (errorText === 'Required') {
        errorText = convertFieldNameToTitleCaseText(name) + ' is Required'
      }
      errorsMap[name] = errorText;
    } else {
      delete errorsMap[name];
    }
  })
}

/**
 * Whether a field of these forms shows its validation error, one the user can fix: what holds an
 * `onApplyPeriods` back (2026-10-23). Until then it sent a table that showed errors, a required field
 * the user had emptied included, as `""`.
 *
 * A field shows its error as it renders it (`errorText` in `modules/form/utils.tsx` and
 * `asInputDateField.tsx`): once the field is touched, remembered as touched, or changed. An untouched,
 * unchanged field's error shows nothing, and holds nothing back. The fields read are those whose error
 * the user can fix (`fixableFieldsOf`): not a disabled or readonly field, and not one that shows no
 * error of its own, such as a toggle, or a table's array of rows, whose error is its rows' errors.
 *
 * It reads the fields' state and changes none: the field it finds already shows its error, which is
 * all the user is shown, and an untouched field is not marked touched.
 */
export function showsAnError (forms: ReadonlyMap<object, RegisteredForm>): boolean {
  for (const { form } of forms.values()) {
    const rememberedTouched = touchedFor(form)
    for (const name of fixableFieldsOf(form).keys()) {
      const state = form.getFieldState(name)
      if (state && state.error && (state.touched || rememberedTouched[name] || !state.pristine)) return true
    }
  }
  return false
}

/*
 Expected format of field validation object
 {
    "orders.lines[0].startDate": {
        "messages": [
            {
                "text": "Start date must be the 1st day of a month."
            }
        ],
    }
}
 */
/**
 * The report a host's `getValidationErrors` is handed: each field's error, as one message.
 *
 * Only a string is a message. The published contract promises one (`UIRenderValidationMessage.text`),
 * and every validator a meta can name returns one. The one other thing that can reach here is a
 * container field's error: final-form gives an array field the array of its items' errors, and each
 * of those items is reported under its own field name already. Such an entry is left out, rather than
 * handed on as an array that a host reading `text` as a string could not show.
 */
export const mapErrorObjectToUIFormat = (errors: Record<string, unknown>) => {
  const result: Record<string, { messages: Array<{ text: string }> }> = {};

  Object.keys(errors).forEach(fieldName => {
    const text = errors[fieldName]
    if (typeof text !== 'string') return
    result[fieldName] = {
      messages: [
        {
          text
        }
      ]
    }
  })

  return result;
}

/** Exported for its unit tests: no other module imports it. */
export const convertFieldNameToTitleCaseText = (str: string) => {
  let fieldName = str;
  if (fieldName.includes('.')) {
    fieldName = fieldName.split('.').pop()!; // not undefined: a split has at least one part
  }
  const result = fieldName.replace(/([A-Z])/g, " $1").trim();

  return result.charAt(0).toUpperCase() + result.slice(1);
}
