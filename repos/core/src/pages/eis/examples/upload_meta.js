import { SIZE_MB_16 } from 'utils-pack'

export default {
  view: 'Input',
  name: 'path.to.file', // path in data.json
  type: 'file', // use dropzone file input
  title: 'Upload CSV File', // hint
  styles: 'button margin-largest', // style dropzone as button
  // label: 'Report', // only used in dropzone style when `showTypes = true`
  formats: ['csv'], // required
  maxSize: SIZE_MB_16, // maximum allowed file size in bytes
  multiple: false, // only allow single file upload
  showTypes: false, // disable on hover hint for dropzone
  autoSubmit: true,
  items: [
    {
      view: 'Icon',
      name: 'file-upload',
      styles: 'margin-right-smaller'
    },
    {
      view: 'Text',
      children: 'Upload File'
    },
  ]
}
