import { SIZE_MB_16 } from 'ui-utils-pack'

const uploadMeta = {
  view: 'Input',
  name: 'path.to.file', // path in data.json
  type: 'file', // use dropzone file input
  title: 'Upload CSV File', // hint
  classWrap: 'left', // move button to the left, instead of centered by default
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


export default uploadMeta