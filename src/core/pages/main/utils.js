import { get, merge, isObject, hasObjectValue } from '../../utils/object'
import { errorsMap } from './rules'
import { FIELD, ISO_8601_FULL } from '../../modules'
import { cloneDeep } from '../../utils'
import { storedTouched } from '../../modules/form'

export const getFormsData = (forms) => {
  const formDataArray = [];

  forms.forEach(value => {
    const { form, meta } = value;
    const formData = getStructuredDataFromFormObject(form, meta);
    if (formData) {
      formDataArray.push(formData);
    }
  })

  return mergeData([...formDataArray]);
}

/**
 * Live {@code dataKind.*} array: merge each row from every form that holds {@code path} in
 * {@code form.getState().values}, shallow-merge row objects (later forms in {@code forms} order win).
 * Length is capped to the minimum array length among those forms so a stale longer copy on the
 * master form does not leave ghost rows after FieldArray.remove (lodash merge keeps trailing indices).
 *
 * @param {string} path - e.g. {@code orders.dataKind.lines} or {@code dataKind.line}
 * @param {Map} forms - {@link formsStorage}
 * @returns {Array<Object>}
 */
export function getLiveMergedDataKindArray (path, forms) {
  const arrays = []
  forms.forEach(({ form }) => {
    if (!form || typeof form.getState !== 'function') return
    const arr = get(form.getState().values, path)
    if (Array.isArray(arr) && arr.length > 0) {
      arrays.push(arr)
    }
  })
  if (!arrays.length) {
    return []
  }
  const cap = Math.min(...arrays.map(a => a.length))
  const out = []
  for (let i = 0; i < cap; i++) {
    let row = {}
    for (const arr of arrays) {
      const piece = arr[i]
      if (piece != null && typeof piece === 'object' && !Array.isArray(piece)) {
        row = { ...row, ...piece }
      }
    }
    out.push(hasObjectValue(row) ? row : {})
  }
  return out
}

/**
 * Get raw form values without Select reordering.
 * Used for showIf lookups where array indices must match the original data order.
 */
export const getRawFormsData = (forms) => {
  const formDataArray = [];

  forms.forEach(value => {
    const { form, meta } = value;
    const { relativePath, relativeIndex } = meta || {};
    if (relativePath && typeof relativeIndex === 'undefined') return;

    const formValues = cloneDeep(form.getState().values);

    if (!relativePath) {
      formDataArray.push(formValues);
    } else {
      formDataArray.push(createObjectStructure(formValues, relativePath, relativeIndex));
    }
  })

  return mergeData([...formDataArray]);
}

const getStructuredDataFromFormObject = (form, meta) => {
  const { relativePath, relativeIndex } = meta || {};

  if (relativePath && typeof relativeIndex === 'undefined') {
    return;
  }

  const formValues = cloneDeep(form.getState().values);
  const formState = changeOptionOrderForSelectFields(formValues, meta);

  if (!relativePath) {
    return formState;
  }

  return createObjectStructure(formState, relativePath, relativeIndex);
}

const createObjectStructure = (value, relativePath, relativeIndex) => {
  return relativePath.split('.').reverse().reduce((acc, item, index) => {
    const result = {};
    if (index === 0) {
      const tmpArray = [];
      tmpArray[relativeIndex] = value;
      result[item] = tmpArray;
    } else {
      result[item] = acc;
    }

    return result;
  }, {})
}

const mergeData = (formData) => {
  let masterDataIndex = -1;
  // Find Master object which contains all data structure
  // It should be one object in array
  // All other objects contain only one property at the first level of the structure
  let result = formData.find((formValues, index) => {
    if (Object.keys(formValues).length !== 1) {
      masterDataIndex = index;
      return true
    }
    return false;
  })

  formData.forEach((formValues, index) => {
    if (index === masterDataIndex) {
      return;
    }

    result = merge(result, formValues);
  })

  return result;
}

export const replaceDeep = (object, key, value) => {
  if (Array.isArray(object)) {
    object.forEach(item => {
      replaceDeep(item, key, value)
    })
  } else if (isObject(object)) {
    if (object.hasOwnProperty(key)) {
      object[key] = value;
    }

    Object.keys(object).forEach(k => {
      replaceDeep(object[k], key, value)
    })
  }
};

function getKeyAndPathFromMetaData(meta) {
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

export function errorsProcessing(form, meta) {
  const { key } = getKeyAndPathFromMetaData(meta);

  if (!key) {
    return;
  }

  const registeredFieldNames = form.getRegisteredFields()
  if (!registeredFieldNames.length) {
    return;
  }

  registeredFieldNames.forEach(field => {
    const { name, error, touched } = form.getFieldState(field);

    if (error && (touched || storedTouched[name])) {
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
    "quote.termDetails[0].termEffectiveDate": {
        "messages": [
            {
                "text": "Record should be effective on the 1st day of month."
            }
        ],
    }
}
 */
export const mapErrorObjectToUIFormat = (errors) => {
  const result = {};

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

export const convertFieldNameToTitleCaseText = (str) => {
  let fieldName = str;
  if (fieldName.includes('.')) {
    fieldName = fieldName.split('.').pop();
  }
  const result = fieldName.replace(/([A-Z])/g, " $1").trim();

  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Find Select fields and change options order in case select was changed
export const changeOptionOrderForSelectFields = (data, meta) => {
  // find data related to Select and change options order
  const recursiveDataParser = (data, optionName, selectValue) => {
    let isDataOrderChanged = false
    const optionIndex = Number(selectValue)
    if (String(selectValue).trim() === '' || !Number.isSafeInteger(optionIndex) || optionIndex < 0) {
      return isDataOrderChanged
    }
    if (isObject(data)) {
      Object.keys(data).forEach(key => {
        const options = data[key]
        if (
          Array.isArray(options) &&
          options[0] &&
          // @Note: truthiness, not `hasOwnProperty`. This heuristic guesses which array is the
          // Select's option list; keying off mere key presence also matches unrelated arrays whose
          // first element carries the key with a falsy value, and reorders them in the payload.
          options[0][optionName] &&
          optionIndex < options.length &&
          optionIndex in options &&
          options[optionIndex] != null
        ) {
          options.unshift(options.splice(optionIndex, 1)[0]);
          isDataOrderChanged = true
        }
      })
    }
    return isDataOrderChanged
  }

  if (meta && meta.view === FIELD.TYPE.SELECT) {
    const selectName = meta.name;
    if (typeof data[selectName] === 'string') {
      const { mapOptions } = meta;
      const { text: optionName, value: optionValue } = mapOptions
      if (typeof mapOptions === 'string') {
        recursiveDataParser(data, mapOptions, data[selectName]) && delete data[selectName]
      } else if (optionValue === '{index}') {
        recursiveDataParser(data, optionName, data[selectName]) && delete data[selectName]
      }
    }
  }

  if (meta && Array.isArray(meta.items)) {
    meta.items.forEach(item => {
      changeOptionOrderForSelectFields(data, item)
    })
  } else if (meta && meta.renderItem && Array.isArray(meta.renderItem.items)) {
    meta.renderItem.items.forEach(item => {
      changeOptionOrderForSelectFields(data, item)
    })
  }

  return data;
}

/*
  Return date in format 'YYYY-MM-DD'
 */
export const getDateStringFromDateObject = (date) => {
  const year = String(date.getUTCFullYear()).padStart(4, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const normalizeIncomingData = (data) => {
  if (!data) {
    return data
  }

  if (typeof data === 'string') {
    if (ISO_8601_FULL.test(data)) {
      // based on previous solution from Normalize function
      return data.split('T')[0]
    }

    return data
  }

  if (typeof data === 'number') {
    return data
  }

  if (data instanceof Date) {
    return getDateStringFromDateObject(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => normalizeIncomingData(item))
  }

  if (Object.keys(data).length) {
    const nextData = {};
    Object.keys(data).forEach(key => {
      nextData[key] = normalizeIncomingData(data[key])
    })
    return nextData;
  }

  return data;
}
