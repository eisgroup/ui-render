import { ACTIVE, NODE_ENV } from 'core/src/common/variables'
import data from 'core/src/pages/eis/data/_data'
import meta from 'core/src/pages/eis/data/_meta'
import express from 'express'
import { API_PORT } from './common/config'

/**
 * REST API SERVER INITIALISATION ==============================================
 * =============================================================================
 */

// Server Config
const server = express()

// Endpoints
server.get('/', (req, res) => res.json({name: 'Hello!'}))
server.get('/config', (req, res) => res.json({name: 'builder.json!'}))
server.get('/data', (req, res) => res.json(data))
server.get('/meta', (req, res) => res.json(meta))

// Start Server
server.listen(API_PORT, () => {
  const localServer = `http://localhost:${API_PORT}`
  console.log(`🚀  REST API ${ACTIVE.SERVICE} is listening in '${NODE_ENV}' mode @ ${localServer}`)
})
