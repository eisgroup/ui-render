import { stateAction } from 'modules-pack/redux/actions'
import { DEFAULT } from 'modules-pack/variables/defaults'
import mongoose from 'mongoose'
import {
  Active,
  capitalize,
  get,
  hasListValue,
  Id,
  isEmpty,
  isEqual,
  isObject,
  set,
  toFlatList,
  toList,
  warn,
} from 'utils-pack'
import { CREATE, DELETE, SUCCESS, UPDATE } from 'utils-pack/constants'
import { eventHooks } from './hook'
import { Localised, ObjectId, Schema, Timestamp, toObjectId, unique } from './types'

/**
 * Wrapper around mongoose.model() method to add all extra base helpers and defaults
 *
 * @param {String} name - of the database model
 * @param {Object} fields - definition of the database model
 * @param {Object} [options] - options for Model schema
 * @param {Object} [config] - config for Model schema
 * @param {Object} [methods] - Model instance methods
 * @param {Object<{'propName': <get Function, set Function>}>} [virtuals] - virtual properties to get and/or set
 * @param {Array} [uniqueTogether] - list of fields that need to be unique together
 * @return {Object} model - Mongoose Model
 */
export function createModel (name, fields, {schema: {options, config, methods, virtuals} = {}, uniqueTogether} = {}) {
  // Schema Setup
  const schema = new Schema(fields, {timestamps: false, ...options})
  schema.plugin(eventHooks)
  schema.set('toJSON', {virtuals: true, ...config})
  schema.set('toObject', {virtuals: true, ...config})
  for (const method in methods) {
    schema.methods[method] = methods[method]
  }

  // Localised String Virtuals (using ...Localised(fields) method)
  if (fields._) {
    if (virtuals == null) virtuals = {}
    // Virtual .lang prop is required to allow Model instance to store user's lang code with Object.assign
    if (virtuals.lang == null) {
      virtuals.lang = {
        get () {return this._lang},
        set (val) {return this._lang = val || DEFAULT.LANGUAGE}
      }
    }
    Object.keys(fields._.type ? fields._.type : fields._).filter(f => f !== '_id').forEach(field => {
      if (virtuals[field]) return // skip manually defined virtuals
      virtuals[field] = {
        get () {
          // @note: if the field is required, but only one language exists, it will throw error for other lang requests
          // thus, fallback to default language, then fallback to the first value found among translated values
          let result = get(this, Localised.path(field, this.lang))
          if (result == null && this.lang !== DEFAULT.LANGUAGE) result = get(this, Localised.path(field, DEFAULT.LANGUAGE))
          if (result == null) {
            let localString = get(this, `_.${field}`)
            if (localString == null) return
            localString = localString.toObject()
            for (const lang in localString) {
              if (localString[lang] != null) return localString[lang]
            }
          }
          return result
        },
        set (val) {
          this.markModified('_')
          return set(this, Localised.path(field, this.lang), val)
        }
      }
    })
  }

  // Virtuals Setup
  for (const prop in virtuals) {
    const {get, set} = virtuals[prop]
    let v = schema.virtual(prop)
    if (get) v.get(get)
    if (set) v.set(set)
  }

  // Indices Setup
  if (uniqueTogether) {
    const _fields = {}
    uniqueTogether.forEach(field => {_fields[field] = 1})
    schema.index(_fields, {unique})
  }

  // Extract ObjectID fields in schema definition for automatic ObjectId transform on updates
  const {obj} = schema
  const objectIdFields = []
  for (const field in obj) {
    if (isEqual(obj[field].type, ObjectId) || isEqual(obj[field], ObjectId)) objectIdFields.push(field)
  }

  // Create the Model
  const model = mongoose.model(capitalize(name), schema)
  model.createOrUpdate = createOrUpdate(model, objectIdFields)
  model.createOrUpdateMany = createOrUpdateMany(model, objectIdFields)
  model.findByIds = findByIds(model)
  model.deleteByIds = deleteByIds(model)

  // Event hooks setup
  if (Active.store) {
    model.on('afterInsert', (entry) => {
      Active.store.dispatch(stateAction(name, CREATE, SUCCESS, entry))
    })
    model.on('afterUpdate', (entry) => {
      Active.store.dispatch(stateAction(name, UPDATE, SUCCESS, entry))
    })
    model.on('afterRemove', (entry) => {
      Active.store.dispatch(stateAction(name, DELETE, SUCCESS, entry))
    })
  }

  // Timestamp automatic generation (new Users will have updated = null)
  if (fields.created === Timestamp) model.on('beforeInsert', (entry) => {entry.created = Date.now()})
  if (fields.updated === Timestamp) model.on('beforeUpdate', (entry) => {entry.updated = Date.now()})

  if (!Active.modelByName) Active.modelByName = {}
  return Active.modelByName[name] = model
}

/**
 * Extract Foreign Keys from Mongoose Schema Recursively
 * @see: model.test.js for scenarios
 *
 * @param {Object} schema - Mongoose Schema instance or plain object
 * @param {String} [separator] - for joining result list to string
 * @returns {String[]|{STRING}} LIST - of foreign keys, with LIST.STRING as space separated String value by default
 */
export function foreignKeys (schema, separator = ' ') {
  // ForeignKey can be nested within lists, or objects, need to recursively find them all
  const result = []
  if (schema instanceof Schema) schema = schema.obj
  for (const key in schema) {
    let nestedList = []
    let definition = schema[key]
    if (definition instanceof Schema) definition = definition.obj
    if (isObject(definition)) {
      // Direct ForeignKey definition
      let {ref, refPath, type} = definition
      if (ref || refPath) {
        result.push(key)
      } else if (type) {
        if (type instanceof Schema) type = type.obj
        if (isObject(type)) {
          // Direct `type` ForeignKey definition
          const {ref, refPath} = type
          if (ref || refPath) {
            result.push(key)
          } else {
            // Nested schema object (`type` as nested key)
            nestedList = foreignKeys(type, separator)
          }
        } else if (hasListValue(type)) {
          // Nested schema list (`type` as nested key)
          nestedList = foreignKeys.list(type, separator, key, result)
        }
      } else {
        // Nested schema object
        nestedList = foreignKeys(definition, separator)
      }
    } else if (hasListValue(definition)) {
      // Nested schema list
      nestedList = foreignKeys.list(definition, separator, key, result)
    }

    if (nestedList.length > 0) result.push(...nestedList.map(path => `${key}.${path}`))
  }

  result.STRING = result.join(separator)
  return result
}

// internal helper function to process nested list and avoid repeating code
foreignKeys.list = function (list, separator, key, result) {
  let nestedList = []
  if (list[0] instanceof Schema) list = list.map(schema => schema.obj)
  if (isObject(list[0])) {
    if (list.length === 1) {
      // Direct List ForeignKey definition
      const {ref, refPath} = list[0]
      if (ref || refPath) {
        result.push(key)
      } else {
        // Nested schema object
        nestedList = foreignKeys(list[0], separator)
      }
    } else {
      // Nested schema list
      nestedList = toFlatList(list.map(schema => foreignKeys(schema, separator)))
    }
  }
  return nestedList
}

/**
 * Create or Update a Single Entry
 *
 * @param {Object} model - database model class
 * @param {Array} [objectIdFields] - model fields that need to be converted to ObjectIds
 * @return {function(entry)} - that takes a single entry as argument and performs save
 *  @returns {Promise<Object|Error>} document - created or error
 */
function createOrUpdate (model, objectIdFields = []) {
  return (entry) => {
    if (isEmpty(entry)) return {}
    try {
      const data = {...entry}
      objectIdFields.forEach(field => {if (data[field]) data[field] = toObjectId(data[field])})
      return model.findOneAndUpdate({_id: data.id || data._id || Id()}, {updated: Date.now(), ...data}, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      })
    } catch (error) {
      warn(error)
      return error
    }
  }
}

/**
 * Create or Update Given Entries
 * @note: uses .bulkWrite - a direct MongoDB method, and does not work with Mongoose `virtuals`
 *
 * @param {Object} model - database model class
 * @param {Array} [objectIdFields] - model fields that need to be converted to ObjectIds
 * @return {function(entries)} - that takes a single or list of entries as argument and performs save
 *  @returns {Promise<Object|Error>} {writeErrors, upserted} - result of the bulkWrite operation, or error
 */
function createOrUpdateMany (model, objectIdFields = []) {
  return (items) => {
    if (isEmpty(items)) return {}
    try {
      return model.bulkWrite(toList(items, 'clean').map(({id, _id, ...data}) => {
        objectIdFields.forEach(field => {if (data[field]) data[field] = toObjectId(data[field])})
        _id = id || _id || Id()
        return ({
          updateOne: {
            filter: {_id},
            update: {_id, updated: Date.now(), ...data},
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        })
      }))
    } catch (error) {
      warn(error)
      return error
    }
  }
}

function findByIds (model) {
  return (ids) => model.find(hasListValue(ids) ? {_id: {$in: ids}} : {_id: null})
}

/**
 * Delete Multiple Entries by Their ID
 *
 * @param {Object} model - class
 * @return {function(ids)} - async function that takes list if IDs as argument
 *  @example return - list if deleted IDs, or rejected Promise if delete failed
 */
function deleteByIds (model) {
  return async (ids) => {
    if (!hasListValue(ids)) return []

    const {n, ok} = await model.deleteMany({_id: {$in: ids}}) || {}
    if (!ok) return Promise.reject(new Error(`${model.name} delete failed for '${ids}'!`))
    if (n === (ids || []).length) return ids
  }
}
