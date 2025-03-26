// Additional modules are optional to optimize for performance
// import modules, { auth, location } from './modules'

/**
 * STATE DATA ==================================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */

export const hasAuthActivated = false // modules.some(({NAME}) => auth.NAME === NAME)
export const hasLocationActivated = false // modules.some(({NAME}) => location.NAME === NAME)

const initState = {
  data: {
    lastNetworkErrorMessage: null,
    location: 0,  // Use 0 to compute initial Error alert
    // actionsPendingAuth: [],  // Failed actions because of missing Authentication
    // actionsPendingLocation: [],  // Failed actions because of missing Location access
    actionsPendingNetwork: []  // Failed actions because of Network connection
  }
}

export default initState
