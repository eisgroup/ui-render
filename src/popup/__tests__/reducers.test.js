import { CLOSE, OPEN } from 'utils-pack'
import { stateAction } from '../../redux/actions'
import { POPUP, POPUP_ERROR } from '../constants'
import initState from '../data'
import reducer from '../reducers'

let stateAfterUpdate = initState

it(`${POPUP} returns the initial state`, () => expect(reducer(initState, {type: ''})).toEqual(initState))

it(`${POPUP} populates details when ${OPEN} action is called, and appends data if it is already open`, () => {
  const payload = {
    activePopup: POPUP_ERROR,
    [POPUP_ERROR]: {
      items: [
        {
          id: '21Fd-213',
          status: 500,
          title: 'Internal Server Error',
          detail: 'Backend server issue'
        },
        {
          id: '87fd-293',
          status: 401,
          title: 'Unauthorized',
          detail: 'Token is required'
        }
      ]
    }
  }

  stateAfterUpdate = reducer(stateAfterUpdate, stateAction(POPUP, OPEN, payload))
  expect(stateAfterUpdate.data).toEqual({...stateAfterUpdate.data, ...payload, activePopups: [POPUP_ERROR]})

  stateAfterUpdate = reducer(stateAfterUpdate, stateAction(POPUP, OPEN, payload))
  expect(stateAfterUpdate.data[POPUP_ERROR].items.length).toEqual(4)
})

it(`${POPUP} closes when ${CLOSE} action is called with activePopup type provided`, () => {
  const payload = {
    activePopup: POPUP_ERROR
  }

  stateAfterUpdate.data.activePopups = [POPUP_ERROR]
  stateAfterUpdate = reducer(stateAfterUpdate, stateAction(POPUP, CLOSE, payload))
  expect(stateAfterUpdate.data.activePopups.length).toEqual(0)
})
