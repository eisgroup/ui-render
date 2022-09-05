import dotenv from 'dotenv'
import { __BACKEND__, __PROD__, __TEST__ } from 'ui-utils-pack'

/**
 * BACKEND SERVER CONFIG =======================================================
 * =============================================================================
 */

dotenv.config()
const variables = {
  API_HOST: 'server_host_name_or_IP_address, like localhost',
  API_PORT: 'the_port_to_serve_on, like 8080',
  SOCKET_PROTOCOL: 'socket_protocol, like wss',
  SOCKET_HOST: 'socket_host_name_or_IP_address, like localhost',
  SOCKET_PORT: 'the_port_to_serve_on, like 8080',
  DOMAIN: 'hostname, example: domain.com',
  DB_HOST: 'server_database_host',
  DB_NAME: 'server_database_name',
  DB_PORT: 'server_database_port',
  DB_USER: 'server_database_username',
  DB_PASS: 'server_database_password',
  ADMIN_EMAIL: 'admin_user_email',
  ADMIN_SEED_ID: 'admin_user_referrer_id',
  SECRET: 'secret_key_to_generate_tokens',
  SERVICE: 'service_unique_identifier',

  // Push Notification
  FCM_EMAIL: 'firebase_cloud_messaging_email',
  FCM_SERVER_KEY: 'firebase_cloud_messaging_server_key',
  FCM_WEB_PUBLIC_KEY: 'firebase_cloud_messaging_web_public_key',
  FCM_WEB_PRIVATE_KEY: 'firebase_cloud_messaging_web_private_key',
}

/* Help Messages */
if (__BACKEND__) {
  Object.keys(variables).forEach((variable) => {
    // Skip check for tests
    if (__TEST__ || (variable === 'SERVICE' && !__PROD__)) return
    if (process.env[variable] == null) {
      throw new Error(`❌ Please enter ${variable} in .env in the root directory, as ${variables[variable]}`)
    }
  })
} else {
  if (!__TEST__) throw new Error(`Cannot use backend config, import from 'src/common/variables.js' instead!`)
}

export const {
  API_PORT,
  SOCKET_PORT,
  DOMAIN,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  DB_USER,
  DB_PASS,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_SEED_ID,
  SECRET,
  FCM_EMAIL,
  FCM_SERVER_KEY,
  FCM_WEB_PUBLIC_KEY,
  FCM_WEB_PRIVATE_KEY,
} = process.env
