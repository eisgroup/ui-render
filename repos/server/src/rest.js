import meta from 'core/src/pages/main/examples/example_components'
import data from 'core/src/pages/main/examples/example_data'
import cors from 'cors'
import express from 'express'
import { __PROD__, Active, NODE_ENV } from 'ui-utils-pack'
import { API_PORT } from './common/config'

/**
 * REST API SERVER INITIALISATION ==============================================
 * =============================================================================
 */

// Server Config
const server = express()
if (!__PROD__) server.use(cors())

// Endpoints
server.get('/', (req, res) => res.json({name: 'Hello!'}))
server.get('/config', (req, res) => res.json({name: 'builder.json!'}))
server.get('/data', (req, res) => res.json(data))
server.get('/meta', (req, res) => res.json(meta))

// Start Server
server.listen(API_PORT, () => {
  const localServer = `http://localhost:${API_PORT}`
  console.log(`🚀  REST API ${Active.SERVICE} is listening in '${NODE_ENV}' mode @ ${localServer}`)
})
