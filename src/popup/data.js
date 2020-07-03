import { POPUP_ALERT, POPUP_CONFIRM, POPUP_ERROR } from './constants'

/**
 * STATE DATA ==================================================================
 * Initial State or Test Data - used to launch the app initially
 * =============================================================================
 */

const initState = {
  data: {
    activePopups: [
      // POPUP_ALERT,
      // POPUP_CONFIRM,
      // POPUP_ERROR,
    ],
    [POPUP_ALERT]: {
      items: [
        // {
        //   title: 'Alert Popup',
        //   content: 'Alert details',
        //   closeLabel: 'Ok'  // optional
        // }
      ]
    },
    [POPUP_CONFIRM]: {
      items: [
        // {
        //   title: 'Confirm Action',
        //   content: 'Confirm details',
        //   confirmLabel: 'Delete',  // optional
        //   confirmClass: 'inverted red',  // optional button className
        //   action: (id) => {},  // dispatch action
        //   id: 'argument to pass to action' // optional
        // }
      ]
    },
    [POPUP_ERROR]: {
      items: [
        // {
        //   id: '21Fd-213',
        //   status: 500,
        //   title: 'Internal Server Error',
        //   detail: 'Backend server issue'
        // },
        // {
        //   id: '87fd-293',
        //   status: 401,
        //   title: 'Unauthorized',
        //   detail: 'Token is required'
        // }
      ]
    }
  },
  ui: {
    isLoading: false,
    className: ''
  }
}

export default initState

export const testPayload = {
  items: [
    {
      title: 'Alert Popup 1',
      content: 'Alert Text',
      closeLabel: 'Ok'  // optional
    },
    // {
    //   title: 'Alert Popup 2',
    //   content: (
    //     <View>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //       <Text>Full React Component</Text>
    //     </View>
    //   )
    // }
  ]
}
