import chalk from 'chalk' // causes `ansi-styles` module not found error inside Docker container if not installed
import { SERVER } from 'core/src/common/variables'
import { Active } from 'ui-utils-pack'

/**
 * SERVICE INITIALISATION ======================================================
 * Must be called first before other imports
 * =============================================================================
 */

if (!Active.SERVICE) Active.SERVICE = SERVER
if (!Active.log) Active.log = chalk
