import classNames from 'classnames'
import React from 'react'
import { ACTIVE } from '../../common/variables'
import Expand from '../Expand'
import Row from '../Row'
import TableView from '../TableView'
import Text from '../Text'
import View from '../View'
import { FIELD } from './constants'

/**
 * Recursive Field Renderer
 *
 * @param {String } [view] - one of FIELD.TYPE
 * @param {Array} [items] - list of nested fields to render
 * @param {*} [props] - other props to pass to given field
 * @param {Number} [i] - index of field in the list
 * @returns {*} Node - React component/s
 */
export default function Render ({view, items = [], ...props}, i) {
  if (props.key == null) props.key = i
  switch (view) {
    case FIELD.TYPE.EXPAND:
      return <Expand {...props}>{() => items.map(Render)}</Expand>
    case FIELD.TYPE.COL:
      return <View {...props}>{items.map(Render)}</View>
    case FIELD.TYPE.ROW:
      return <Row {...props}>{items.map(Render)}</Row>
    case FIELD.TYPE.TABLE:
      return <TableView items={items} {...props}/>
    case FIELD.TYPE.TITLE:
      return <Text {...props} className={classNames('h3', props.className)}/>
    default:
      return ACTIVE.renderField({view, items, ...props})
  }
}
