import React from 'react'

/** One `<col>` per entry, styled as the meta's `colGroup` says. */
export type TableColGroupProps = { colGroup: Array<{ style?: React.CSSProperties }> }

const TableColGroup = ({ colGroup }: TableColGroupProps) => {
  return (
    <colgroup>
      {colGroup.map(column => {
        return <col style={column.style}/>
      })}
    </colgroup>
  )
}

export default TableColGroup;