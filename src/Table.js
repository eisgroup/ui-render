import React from 'react'
import { Table as TableS } from 'semantic-ui-react' // adds 4 KB to final js bundle, but has many features
import View from './View'

function Table ({
  fixedHeader = false,
  ...props
}) {
  return (fixedHeader
      ? <View className='app__table__container--fixed-header'>
        <View className='app__table__container__inner--fixed-header'>
          <TableS {...props} />
        </View>
      </View>
      : <TableS {...props} />
  )
}

Table.Header = TableS.Header
Table.HeaderCell = TableS.HeaderCell
Table.Row = TableS.Row
Table.Cell = TableS.Cell
Table.Body = TableS.Body
Table.Footer = TableS.Footer

export default React.memo(Table)
