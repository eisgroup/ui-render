/**
 * MONGOOSE HOOKS ==============================================================
 * =============================================================================
 */

/**
 * Mongoose plugin adding lifecycle events on the model class.
 *
 * Initialization is straightforward:
 *     import {eventHooks} from '../utils/mongoose.js'
 *     const User = new Schema({ ... });
 *     User.plugin(eventHooks);
 *
 * Now the model emits lifecycle events before and after persistence operations:
 * You can listen to these events directly on the model.
 *      import User from './models'
 *      User.on('beforeInsert', function(entry) {
 *        // do stuff with entry object...
 *      })
 *
 *  - beforeInsert
 *  - afterInsert
 *  - beforeUpdate
 *  - afterUpdate
 *  - beforeSave (called for both inserts and updates)
 *  - afterSave (called for both inserts and updates)
 *  - beforeRemove
 *  - afterRemove
 */
export function eventHooks (schema) {
  schema.pre('save', function (next) {
    const model = this.model(this.constructor.modelName)
    model.emit('beforeSave', this)
    this.isNew ? model.emit('beforeInsert', this) : model.emit('beforeUpdate', this)
    this._isNew_internal = this.isNew
    next()
  })
  schema.post('save', function () {
    const model = this.model(this.constructor.modelName)
    model.emit('afterSave', this)
    this._isNew_internal ? model.emit('afterInsert', this) : model.emit('afterUpdate', this)
    this._isNew_internal = undefined
  })
  schema.pre('remove', function (next) {
    this.model(this.constructor.modelName).emit('beforeRemove', this)
    next()
  })
  schema.post('remove', function () {
    this.model(this.constructor.modelName).emit('afterRemove', this)
  })
}
