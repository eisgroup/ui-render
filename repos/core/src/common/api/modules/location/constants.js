/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */
export { GET, CREATE, UPDATE, DELETE, LIST, SET, FINISH } from '../../../constants'
export { REQUEST, SUCCESS, ERROR, TIMEOUT, PREFETCH } from '../../constants'

export const NAME = 'LOCATION'  // Namespace this module
export const LOCATION_LIFESPAN = 90000  // milliseconds (about 100m distance change at 4km/h walk speed)
