import { SIZE_MB_16, SIZE_KB } from '../../core/utils'

const SIZE_MB_2 = SIZE_KB * 1024 * 2

const uploadVariantsMeta = {
  view: 'VerticalLayout',
  styles: 'padding-large',
  items: [
    {
      view: 'Title',
      label: 'Default dropzone',
      styles: 'h4 margin-bottom-small',
    },
    {
      view: 'Text',
      children: 'Click or drop a file. Format hint shows on hover.',
      styles: 'margin-bottom',
    },
    {
      view: 'Input',
      type: 'file',
      name: 'singleCsv',
      title: 'Upload CSV file',
      formats: ['csv'],
      maxSize: SIZE_MB_16,
      multiple: false,
      label: 'CSV',
    },
    {
      view: 'Title',
      label: 'Multiple files',
      styles: 'h4 margin-top-large margin-bottom-small',
    },
    {
      view: 'Text',
      children: 'Supports several formats and accepts up to 5 MB per file.',
      styles: 'margin-bottom',
    },
    {
      view: 'Input',
      type: 'file',
      name: 'multipleDocs',
      title: 'Upload documents',
      formats: ['pdf', 'doc', 'docx', 'txt'],
      maxSize: SIZE_KB * 1024 * 5,
      multiple: true,
      label: 'document',
    },
    {
      view: 'Title',
      label: 'Image upload (button style, no hover hint)',
      styles: 'h4 margin-top-large margin-bottom-small',
    },
    {
      view: 'Input',
      type: 'file',
      name: 'avatar',
      title: 'Upload an image',
      classWrap: 'left',
      styles: 'button margin-bottom',
      formats: ['png', 'jpg', 'jpeg', 'webp'],
      maxSize: SIZE_MB_2,
      multiple: false,
      showTypes: false,
      items: [
        { view: 'Icon', name: 'image', styles: 'margin-right-smaller' },
        { view: 'Text', children: 'Choose image' },
      ],
    },
    {
      view: 'Title',
      label: 'Read-only',
      styles: 'h4 margin-top-large margin-bottom-small',
    },
    {
      view: 'Input',
      type: 'file',
      name: 'readonlyUpload',
      title: 'Upload disabled',
      formats: ['csv'],
      readonly: true,
      label: 'CSV',
    },
  ],
}

export default uploadVariantsMeta
