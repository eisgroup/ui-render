/**
 * HOW THE ENGINE MAPS VALIDATION ERRORS: which of a form's errors are shown (a touched field's, or
 * one the form remembers as touched), and the shape `getValidationErrors` hands a host.
 *
 * It was part of `engine/utils.ts` until §9.9-H6, which dissolved that file into `formData.ts`,
 * `errorMapping.ts` and `dataMapping.ts`.
 */
import type { FormApi } from 'final-form'
import { errorsFor, touchedFor } from '../state/formRegistry'
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
export const mapErrorObjectToUIFormat = (errors: Record<string, unknown>) => {
  const result: Record<string, { messages: Array<{ text: unknown }> }> = {};

  Object.keys(errors).forEach(fieldName => {
    result[fieldName] = {
      messages: [
        {
          text: errors[fieldName]
        }
      ]
    }
  })

  return result;
}

export const convertFieldNameToTitleCaseText = (str: string) => {
  let fieldName = str;
  if (fieldName.includes('.')) {
    fieldName = fieldName.split('.').pop()!; // not undefined: a split has at least one part
  }
  const result = fieldName.replace(/([A-Z])/g, " $1").trim();

  return result.charAt(0).toUpperCase() + result.slice(1);
}
