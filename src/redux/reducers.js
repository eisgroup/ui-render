import { CLOSE, FINISH, isInList, LOAD, OPEN, START } from 'utils-pack'
import { stateActionType } from './actions'

/**
 * ACTION HANDLER HELPERS ======================================================
 * =============================================================================
 */

// See `popup` module for reference
export const popupsInitState = {
  activePopups: [
    // ROUTE.RESULT,
    // ROUTE.MATCH,
  ],
  // [ROUTE.RESULT]: {
  //   items: [],
  // },
}

export function popups (NAME) {
  return {
    /* Subscribe to POPUP action */
    [stateActionType(NAME, OPEN)]: (state, {payload, payload: {activePopup} = {}}) => {
      // Append items if Popup is already Open
      if (isInList(state.activePopups, payload.activePopup)) {
        return {
          ...state,
          [activePopup]: {
            ...state[activePopup],
            items: [
              ...(state[activePopup] || {}).items || [],
              ...(payload[activePopup] || {}).items || []
            ]
          }
        }
      }
      // Else, set them to current payload (thus, removing previous items)
      return {
        ...state,
        ...payload, // payload must have `items` nested inside `activePopup` key -> {[activePopup]: {items: [...]}}
        activePopups: [...state.activePopups, activePopup]
      }
    },

    /* Close Popup */
    [stateActionType(NAME, CLOSE)]: (state, {payload: {activePopup, id = null}}) => {
      // Closing only specified item ID
      if (id) {
        const items = ((state[activePopup] || {}).items || []).filter(item => item.id !== id)
        return {
          ...state,
          [activePopup]: {
            ...state[activePopup],
            items
          },
          // Close the entire popup if no more items left
          ...!items.length && {activePopups: state.activePopups.filter(item => item !== activePopup)}
        }
      }
      // Closing the entire popup by its type
      return {
        ...state,  // Closing does not remove items, because garbage collection is handled by OPEN action logic above
        activePopups: state.activePopups.filter(item => item !== activePopup)
      }
    }
  }
}

export function uiLoading (NAME) {
  return {
    /* Subscribe to loading start action */
    [stateActionType(NAME, LOAD, START)]: (state) => ({...state, isLoading: true}),

    /* Subscribe to loading complete action */
    [stateActionType(NAME, LOAD, FINISH)]: (state) => ({...state, isLoading: false})
  }
}
