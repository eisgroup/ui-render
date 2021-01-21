import { PERMISSION } from 'modules-pack/user/definitions'
import { CURRENCY, PHONE, VALIDATE } from 'modules-pack/variables'
import mongoose from 'mongoose'
import { phone } from 'react-ui-pack/inputs/normalizers'
import {
  by,
  enumFrom,
  get,
  isContinuousNumberRanges,
  isNumeric,
  isPhoneNumber,
  startEndFromNumberRanges
} from 'utils-pack'
import { toRgbaColor } from 'utils-pack/color'
import { isId } from 'utils-pack/utility'
import isEmail from 'validator/es/lib/isEmail'
import isURL from 'validator/es/lib/isURL'
import './database' // initialize database automatically on import of this file

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
export const isEmail = [isEmail, 'Please enter a valid email address']
export const isColor = [toRgbaColor, 'Please enter a valid RGBA(A) Color']
export const Json = {type: Mixed, default: undefined}

/**
 * TYPES -----------------------------------------------------------------------
 */
// @Note: add `default: undefined` to easily declare fallback when destructuring instances,
// else, Mongoose will default to empty of given type (a.k.a. default for objects will be empty `{}`)
// @note: For array of sub-documents, sub-documents cannot be declared with nested `type` prop.
export const Id = {type: String, validate: isId, default: undefined}
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
export const FileList = {type: [FileType], default: undefined}
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
    type: ObjectId, // todo: test if it works with custom Id string and nested queries work as well
    ref: modelName,
    validate: {
      validator: (input) => mongoose.model(modelName).findById(input),
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
    type: ObjectId,
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
 * todo: Files Type Creator for Mongoose Model Field
 *
 * @param {Array<String>} [kinds] - list of photo kinds, example ['public', 'private']
 * @returns {Object<dir, data>} type - for Mongoose field definition
 * @constructor
 */
export function Files (kinds = ['public']) {
  const data = {}
  kinds.forEach(key => (data[key] = FileList))
  return new Schema({
    dir: {type: String, required}, // relative path to UPLOAD_PATH where photos are saved, for resolver to compute src
    data,
    _id: false,
  }, {timestamps: false})
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
