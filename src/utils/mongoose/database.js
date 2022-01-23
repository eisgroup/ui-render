import mongoose from 'mongoose'
import sanitizer from 'mongoose-sanitizer'
import { __TEST__ } from 'utils-pack'
import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER, DOMAIN } from '../server/config'

/**
 * DATABASE CONFIG =============================================================
 * Initiate Database Connection (Model definitions and Queries will be buffered)
 * =============================================================================
 */

if (__TEST__) {
  console.log(`⚡  Mongoose disabled for JEST tests`)
} else {
  const uri = `mongodb://${DB_HOST}${DOMAIN ? ('.' + DOMAIN) : ''}:${DB_PORT}/${DB_NAME}`
  const options = (DB_USER && DB_PASS) ? {user: DB_USER, pass: DB_PASS} : {}
  mongoose.Promise = Promise  // use Promise, instead of default Node.js function (err, ...) callbacks
  mongoose.plugin(sanitizer)
  // mongoose.plugin(uniqueValidator) // causes Error in Mongoose 6
  // Mongoose 5.7.5 only options
  // useCreateIndex: true,
  // useFindAndModify: false,
  // useNewUrlParser: true,
  // useUnifiedTopology: true
  mongoose.connect(uri, options)
    .then(() => console.log(`⚡  Mongoose connected to ${uri}`))
    .catch(err => {
      console.error(`✋  Mongoose ${uri} connection failed with:` + err)
      process.exit(1)
    })
}
