import meta from './expand-list_meta'

delete meta.renderLabel
export default {
  ...meta,
  view: 'RowList',
  styles: 'justify wrap'
  // row: true,
}

