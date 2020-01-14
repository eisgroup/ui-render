import React from 'react'
import { ACTIVE } from '../../common/variables'
import Expand from '../Expand'
import Row from '../Row'
import TableLayout from '../TableLayout'
import Text from '../Text'
import View from '../View'

/**
 * EXPORTS =====================================================================
 * Modules' Exposing API - to enable consistent and maintainable app integration
 * =============================================================================
 */

const Field = {
  Expand: ({items, ...props}) => <Expand {...props}>{items.map(ACTIVE.renderField)}</Expand>,
  Col: ({items, ...props}) => <View {...props}>{items.map(ACTIVE.renderField)}</View>,
  Row: ({items, ...props}) => <Row {...props}>{items.map(ACTIVE.renderField)}</Row>,
  Title: (props) => <Text {...props}/>,
  Table: (props) => <TableLayout {...props}/>,
}
export default Field
