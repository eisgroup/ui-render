import { __DEV__ } from 'utils-pack'

export default {
  view: 'Button',
  items: [
    {
      view: 'Icon',
      name: 'file-download',
      styles: 'margin-right-smaller'
    },
    {
      view: 'Text',
      children: 'Download File Template'
    },
  ],
  onClick: {
    name: 'download',
    args: [
      // Using path relative to the URL the page is on
      (__DEV__ ? '' : '/ui-render') + '/static/images/ui-architecture.png',
      'optional-file-name-to-save-as.png'
    ]
  }
}

