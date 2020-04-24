import meta from './expand-list_meta'

export default {
  // view: 'List', // defaults to Column layout
  // row: true, // using Row layout
  view: 'RowList', // alternative way of defining Row layout
  name: 'coverages',
  styles: 'justify wrap', // should have `wrap` class added to collapse in mobile view
  renderItem: meta.renderItem,
}
