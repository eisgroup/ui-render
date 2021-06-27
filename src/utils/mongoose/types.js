import { CONFIG, CURRENCY, PERMISSION, PHONE, VALIDATE } from 'modules-pack/variables'
import mongoose from 'mongoose'
import { phone } from 'react-ui-pack/inputs/normalizers'
import {
  assertBackend,
  by,
  enumFrom,
  get,
  hasObjectValue,
  Id as _Id,
  isContinuousNumberRanges,
  isNumeric,
  isPhoneNumber,
  LANGUAGE,
  startEndFromNumberRanges,
} from 'utils-pack'
import { toRgbaColor } from 'utils-pack/color'
import { isId } from 'utils-pack/utility'
import isEmailValidator from 'validator/es/lib/isEmail'
import isURL from 'validator/es/lib/isURL'
import './database' // initialize database automatically on import of this file

assertBackend()
/**
 * DATABASE HELPERS ============================================================
 * =============================================================================
 */

export const Schema = mongoose.Schema
export const Mixed = Schema.Types.Mixed
export const ObjectId = Schema.Types.ObjectId
export const index = true
export const required = true
export const unique = true
export const isEmail = [isEmailValidator, 'Please enter a valid email address']
export const isColor = [toRgbaColor, 'Please enter a valid RGBA(A) Color']
export const Json = {type: Mixed, default: undefined}

/**
 * TYPES -----------------------------------------------------------------------
 */
// @Note: add `default: undefined` to easily declare fallback when destructuring instances,
// else, Mongoose will default to empty of given type (a.k.a. default for objects will be empty `{}`)
// @note: For array of sub-documents, sub-documents cannot be declared with nested `type` prop.
export const Id = {type: String, validate: isId, default: () => _Id()}
export const Ids = {type: [Id], default: undefined}
export const Timestamp = {type: Number, validate: isNumeric, default: undefined}
export const URL = {type: String, validate: isURL, default: undefined}
export const About = {type: String, maxLength: VALIDATE.ABOUT_MAX_LENGTH, default: undefined}
export const Address = {type: String, maxLength: VALIDATE.ADDRESS_MAX_LENGTH, default: undefined}
export const Action = {type: {type: String}, payload: Json, meta: Json, error: Boolean, _id: false}
export const Actions = {type: [Action], default: undefined}
export const ActionHistory = {type: [Action], set: val => val.sort(by('-meta.time')), default: undefined}
export const Color = {type: [Number], validate: isColor, default: undefined}
export const CurrencySymbol = {type: String, enum: enumFrom(CURRENCY), default: undefined}
export const Email = {type: String, validate: isEmail}
export const LanguageCode = {type: String, enum: enumFrom(LANGUAGE), default: undefined}
export const FileType = new Schema({
  src: String, // may be absent (to be computed with resolvers if the file is stored by the server)
  i: String,
  kind: String,
  name: {type: String, maxLength: VALIDATE.FILE_NAME_MAX_LENGTH},
  creatorId: Id,
  created: Timestamp,
  updated: Timestamp,
  _id: false,
})
export const Files = {type: [FileType], default: undefined}
export const Location = new Schema({
  lat: {type: Number, required},
  lng: {type: Number, required},
  accuracy: Number,
  timestamp: Timestamp,
  _id: false,
}, {timestamps: false, default: undefined})
export const Name = {type: String, maxLength: VALIDATE.NAME_MAX_LENGTH, default: undefined}
export const KeyVal = {
  type: String,
  value: Mixed,
}
export const Pay = {
  type: {
    currency: CurrencySymbol,
    interval: Timestamp,
    min: Number,
    max: Number,
    total: Number,
  },
  _id: false,
  // @IMPORTANT!
  // default: undefined - cannot be undefined to prevent 500 errors when required
  // However, `default: {}` does not work either because Mongo does not save empty {}.
  // Solution is to prevent model.save() with this field being required and empty.
}
export const Permissions = {type: enumFrom(PERMISSION).reduce((o, k) => ({...o, [k]: Boolean}), {}), default: undefined}
export const Point = {type: {lat: Number, lng: Number}, default: undefined}
export const Phones = new Schema({
  ...enumFrom(PHONE).reduce((o, k) => ({
    ...o, [k]: {type: String, validate: isPhoneNumber, set: (v) => phone(v).replace(/[^\d]+$/g, '')}
  }), {}),
  _id: false,
}, {timestamps: false, default: undefined})
export const TimeRange = {from: Timestamp, to: Timestamp, _id: false}
export const TimeRanges = {
  type: [TimeRange],
  validate: {
    validator: (input) => isContinuousNumberRanges(input.toObject()),
    message: props => `${props.value} is not a valid list of continuous timestamp ranges.`
  },
  set (times) {
    const {start, end} = startEndFromNumberRanges(times)
    this.start = start
    this.end = end
    return times
  },
  default: undefined,
}

/**
 * VALUES ----------------------------------------------------------------------
 */
export const allPermissions = enumFrom(PERMISSION).reduce((o, k) => ({...o, [k]: true}), {})

/**
 * HELPERS ---------------------------------------------------------------------
 */

/**
 * Localised String Fields Definition for MongoDB
 *   - Requires createModel() setup and @localised decorator for GQL Resolver.
 *   - Each defined field then becomes virtual getter/setter for currently active language.
 *   - Virtual fields fallback to default language, or to the first value found among translated values.
 *   - You can also set Localised String object directly for multiple languages.
 *
 * @example:
 *    const schema = {
 *      _id: Id,
 *      ...Localised({
 *        about: String,
 *        name: {maxLength: VALIDATE.NAME_MAX_LENGTH, required},
 *      })
 *    }
 *    export const Model = createModel(MODEL, schema)
 *    => Results in below schema if LocalString has `en` and `ru` languages activated
 *    >>> schema: {
 *      _id: Id,
 *      _: {
 *        type: {
 *          about: {
 *            en: String,
 *            ru: String,
 *          },
 *          name: {
 *            type: {
 *              en: {type: String, maxLength: VALIDATE.NAME_MAX_LENGTH},
 *              ru: {type: String, maxLength: VALIDATE.NAME_MAX_LENGTH},
 *            },
 *            required,
 *          }
 *        },
 *        required,
 *      },
 *      // about - becomes virtual getter/setter
 *      // name - becomes virtual getter/setter
 *    }
 *
 * @param {Object} fields - to be localised, each can be either a String, or Object type definition used in Mongoose
 * @param {Object} [LocalString] - nested key/value pairs of activated languages by their ISO code
 * @returns {{_: Object}} fields - defined under `_` property of the schema, and virtuals are to be set by createModel()
 */
export function Localised (fields, LocalString) {
  if (!LocalString) {
    LocalString = {}
    enumFrom(CONFIG.LANGUAGE_OPTIONS).forEach(key => LocalString[key] = String)
  }
  const result = {}
  let isRequired
  for (const key in fields) {
    const field = fields[key]
    const isObj = hasObjectValue(field)
    if (!isObj && field !== String)
      throw new Error(`${Localised.name}.${key} can only be String or plain Object with value, not ${field}`)
    if (isObj) {
      // Pass declared field options to activated language codes
      const {required, ...options} = field
      const localString = hasObjectValue(options) ? {type: String, ...options} : String
      if (required) {
        isRequired = true
        result[key] = {type: {}, required}
        for (const lang in LocalString) {
          result[key].type[lang] = localString
        }
      } else {
        result[key] = {}
        for (const lang in LocalString) {
          result[key][lang] = localString
        }
      }
    } else {
      result[key] = LocalString
    }
  }

  // Then set declared fields as virtuals inside createModel()...
  return {
    _: isRequired ? {type: result, required} : result
  }
}

Localised.path = function (field, lang) {
  return `_[${field}][${lang}]`
}

/**
 * Foreign Key Type Creator for Mongoose Model Field (automatically verifies integrity)
 *
 * @note: Mongoose does not validate that the foreign key points to existing document by default
 * @example:
 *    eventSchema = new Schema({
 *      creator: ForeignKey('User')
 *    })
 *
 * @param {String} modelName - that the foreign key belongs to
 * @param {Object} [options] - extra field attributes
 * @returns {Object} type - foreign key as ObjectId referencing the given model name
 */
export function ForeignKey (modelName, options) {
  // noinspection JSUnresolvedFunction
  return {
    type: String, // @note: setting `type: Id` throws error, but works with String or ObjectId
    ref: modelName,
    validate: {
      validator: input => mongoose.model(modelName).findById(input),
      message: props => `Foreign key ID ${props.value} does not exist`
    },
    ...options,
  }
}

/**
 * Dynamic Foreign Key Type Creator for Mongoose Model Field (automatically verifies integrity)
 *
 * @example:
 *  const eventSchema = {
 *    host: ForeignDynamicKey('hostType', {required}), // entity that owns the Event (i.e. Company or User)
 *    hostType: {type: String, enum: [USER, COMPANY], required, default: USER},
 *  }
 *
 * @param {String} refField - to get model name reference for the foreign key
 * @param {Object} [options] - extra field attributes
 * @returns {Object} type - foreign key as ObjectId referencing the dynamic model name
 */
export function ForeignDynamicKey (refField, options) {
  return {
    type: String,
    refPath: refField,
    validate: {
      validator (input) { // noinspection JSUnresolvedFunction
        return mongoose.model(get(this, refField)).findById(input)
      },
      message: props => `Foreign key ID ${props.value} does not exist for ${get(this, refField)}`
    },
    ...options,
  }
}

/**
 * Convert String ID to ObjectId
 *
 * @param {String} id - to convert
 * @return {Object} ID
 */
export function toObjectId (id) {
  return mongoose.Types.ObjectId(id)
}

/**
 * Check if given value is a MongoDb Object ID
 *
 * @param {*} value - to check
 * @returns {Boolean} true - if it is
 */
export function isObjectId (value) {
  return value instanceof mongoose.Types.ObjectId
}

/**
 * Check if given String is of valid MongoDb Object ID format
 *
 * @param {String} value - to check
 * @returns {Boolean} true - if it is
 */
export function isObjectID (value) {
  return /^[0-9a-fA-F]{24}$/.test(value)
}

/**
 * Foreign Key Type Creator with User and Permission levels
 *
 * @param {String} modelName - that the foreign key belongs to
 * @param {Object} [fields] - extra field attributes
 * @returns {Object} type - object referencing the given model name
 */
export function UserPermission (modelName, fields) {
  return {
    user: ForeignKey(modelName, {required}),
    permissions: {...Permissions, required},
    _id: false,
    ...fields,
  }
}

/**
 * Map Javascript Constructor Type to Mongoose { field: { $type: <BSON type> } }
 * @see: https://docs.mongodb.com/manual/reference/operator/query/type/
 *
 * @param {*} type - js constructor property
 * @returns {String} - Mongoose data type used for filtering
 */
export function toDatabaseType (type) {
  switch (type) {
    case Array:
      return 'array'
    case Object:
      return 'object'
    case Number:
      return 'double'
    case Boolean:
      return 'bool'
    case String:
    default:
      return 'string'
  }
}
