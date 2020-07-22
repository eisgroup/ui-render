import cookies from 'cookies'
import { merge, set } from 'core/src/common/utils'
import { Active, API_GQL_URI, DEFAULT, NODE_ENV } from 'core/src/common/variables'
import { GraphQLError } from 'graphql'
import { formatErrorGenerator, SevenBoom as Response } from 'graphql-apollo-errors'
import { GraphQLServer } from 'graphql-yoga'
import modules from 'modules-pack'
import commonModules from './common'
import { API_PORT, SECRET } from './common/config'
import commonResolver from './common/resolvers'
import commonSchema from './common/schema.gql'
// import { onConnect, tokenParser } from 'modules-pack/user/auth'

const resolvers = merge(
  commonResolver,
  ...commonModules.filter(({resolver}) => !!resolver).map(({resolver}) => resolver),
  ...modules.filter(({resolver}) => !!resolver).map(({resolver}) => resolver),
)
const schemas = [
  commonSchema,
  ...commonModules.filter(({schema}) => !!schema).map(({schema}) => schema),
  ...modules.filter(({schema}) => !!schema).map(({schema}) => schema),
]

/**
 * GRAPHQL SERVER INITIALISATION ===============================================
 * =============================================================================
 */

// Server Config
const server = new GraphQLServer({
  typeDefs: schemas,
  resolvers,
  // insert Token payload into GraphQl Context
  context: ({request: req, response: res, connection: sub}) => {
    const user = req.token
    if (user && user.id) set(Active.usersById, `${user.id}.lastOnline`, Date.now())
    return {req, res, sub, user}
  }
})

// Apply Middleware
server.express.use(
  // Playground settings must be set to "request.credentials": "include" or "same-origin", for cookies to work
  cookies.express([SECRET]),  // enable Cookies for Token storage (attaches cookie functions to request and response)
  // tokenParser(SECRET), // decode Token in Request Cookies
)

// Start Server
server.start({
  // cors is not needed for cookies with graphql-yoga@1.18.3 setup
  port: API_PORT,
  endpoint: API_GQL_URI,
  // subscriptions: {path: API_SUBSCRIPTION_URI, onConnect},
  uploads: {
    maxFileSize: DEFAULT.UPLOAD_FILE_SIZE,
  },
  formatError: formatErrorGenerator({
    nonBoomTransformer:
      err => {
        return (err instanceof GraphQLError || err.name === 'ValidationError'
          ? Response.badRequest(err.message.replace(/\s"/g, ' {').replace(/"[\s|.]/g, '} '))
          : Response.badImplementation(err.message))
      }
  }),
}, () => {
  const localServer = `http://localhost:${API_PORT}`
  console.log(`🚀  GraphQL ${Active.SERVICE} is listening in '${NODE_ENV}' mode @ ${localServer}${API_GQL_URI}`)
})
