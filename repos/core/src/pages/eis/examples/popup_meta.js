import { cloneDeep } from 'utils-pack'
import content from './table-nested_meta'

export default {
  view: 'Col',
  styles: 'fill middle center padding',
  items: [
    {
      view: 'Button',
      children: 'Open Popup 1',
      styles: 'margin',
      onClick: {
        name: 'popupOpen',
        args: [
          'popup1', // the first argument is Popup.id
          // the second argument can be optional props object to pass to Popup component (not implemented yet)
        ]
      }
    },
    {
      view: 'Popup',
      id: 'popup1', // is used to open popup remotely
      items: [
        cloneDeep(content)
      ]
    },
    cloneDeep(content), // for testing changes made inside Popup -> should sync
  ]
}
