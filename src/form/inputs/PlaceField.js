import { asField } from 'modules-pack/form'
import { POPUP } from 'modules-pack/popup'
import { connect, stateAction } from 'modules-pack/redux'
import React from 'react'
import Place from 'react-ui-pack/inputs/Place'
import { ALERT } from 'utils-pack'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapDispatchToProps = (dispatch) => ({
  actions: {
    popupAlert: (message) => dispatch(stateAction(POPUP, ALERT, {
      items: [{
        title: 'An Error Has Occurred!',
        content: message,
        closeLabel: 'Ok'  // optional
      }]
    })),
  }
})
// @withGql({
//   query: {
//     query, variables: {
//       apiKey: {
//         api: API_PLACES,
//         provider: API_PROVIDER_GOOGLE,
//         platform: API_PLATFORM_WEB,
//       }
//     }
//   }
// })
const PlaceContainer = connect(null, mapDispatchToProps)(Place)
/**
 * Place Field connected with react-final-form or redux-form
 */
export default asField(PlaceContainer, {sanitize: (value) => value || undefined})

