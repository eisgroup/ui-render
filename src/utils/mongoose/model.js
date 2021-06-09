import { stateAction } from 'modules-pack/redux/actions'
import mongoose from 'mongoose'
import {
  Active,
  capitalize,
  CREATE,
  DELETE,
  hasListValue,
  isEmpty,
  isEqual,
  SUCCESS,
  toList,
  UPDATE,
  warn
} from 'utils-pack'
import { eventHooks } from './hook'
import { ObjectId, Schema, Timestamp, toObjectId, unique } from './types'

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
  for (const prop in virtuals) {
    const {get, set} = virtuals[prop]
    let v = schema.virtual(prop)
    if (get) v.get(get)
    if (set) v.set(set)
  }
  if (uniqueTogether) {
    const fields = {}
    uniqueTogether.forEach(field => {fields[field] = 1})
    schema.index(fields, {unique})
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

  // Setup event hooks
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

  // Updated Timestamp (new Users will have updated = null)
  if (fields.updated === Timestamp) model.on('beforeUpdate', (entry) => {entry.updated = Date.now()})

  return model
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
      return model.findOneAndUpdate({_id: data.id || data._id}, {updated: Date.now(), ...data}, {
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
        return ({
          updateOne: {
            filter: {_id: id || _id},
            update: {_id: id || _id, updated: Date.now(), ...data},
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
