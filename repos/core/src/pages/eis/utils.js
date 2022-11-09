import { merge, isObject } from 'ui-utils-pack/object'
import { errorsMap } from './rules'
import { FIELD } from 'ui-modules-pack'

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

const getStructuredDataFromFormObject = (form, meta) => {
  const { relativePath, relativeIndex } = meta;

  if (relativePath && typeof relativeIndex === 'undefined') {
    return;
  }

  const formState = changeOptionOrderForSelectFields(form.getState().values, meta);

  if (!relativePath) {
    if (formState.dataKind) {
      delete formState.dataKind;
    }
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
  const { key, path } = getKeyAndPathFromMetaData(meta);
  const errors = {};

  if (!key) {
    return;
  }

  const registeredFieldNames = form.getRegisteredFields()
  if (!registeredFieldNames.length) return;

  registeredFieldNames.forEach(field => {
    const { name, error } = form.getFieldState(field);
    if (error) {
      let errorText = error;
      if (errorText === 'Required') {
        errorText = convertFieldNameToTitleCaseText(name) + ' is Required'
      }
      errors[`${path}${name}`] = errorText;
    }
  })

  if (Object.keys(errors).length) {
    errorsMap[key] = errors;
  } else {
    delete errorsMap[key];
  }
}

export const clearErrorsMap = (form, meta) => {
  const { key } = getKeyAndPathFromMetaData(meta);

  if (!key) {
    return;
  }

  delete errorsMap[key];
}

/*
 Expected format of filed validation object (from Policy team)
 {
    "quote.termDetails[0].termEffectiveDate": {
        "messages": [
            {
                "text": "Master Policy should be effective on the 1st day of month."
            }
        ],
    }
}
 */
export const mapErrorObjectToUIFormat = (errors) => {
  const result = {};

  Object.keys(errors).forEach(key => {
    Object.keys(errors[key]).forEach(fieldName => {
      result[fieldName] = {
        messages: [
          {
            text: errors[key][fieldName]
          }
        ]
      }
    })
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
const changeOptionOrderForSelectFields = (data, meta) => {
  // find data related to Select and change options order
  const recursiveDataParser = (data, optionName, selectValue) => {
    let isDataOrderChanged = false
    if (isObject(data)) {
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key]) && data[key][0] && data[key][0][optionName]) {
          data[key].unshift(data[key].splice(selectValue, 1)[0]);
          isDataOrderChanged = true
        }
      })
    }
    return isDataOrderChanged
  }

  if (meta.view === FIELD.TYPE.SELECT) {
    const selectName = meta.name;
    if (typeof data[selectName] === 'string') {
      const { mapOptions: { text: optionName, value: optionValue } } = meta;
      if (optionValue === '{index}') {
        recursiveDataParser(data, optionName, data[selectName]) && delete data[selectName]
      }
    }
  }

  if (Array.isArray(meta.items)) {
    meta.items.forEach(item => {
      changeOptionOrderForSelectFields(data, item)
    })
  }

  return data;
}