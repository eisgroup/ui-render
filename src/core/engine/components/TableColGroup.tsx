import React from 'react'

/** One `<col>` per entry, styled as the meta's `colGroup` says. */
export type TableColGroupProps = { colGroup: Array<{ style?: React.CSSProperties }> }

const TableColGroup = ({ colGroup }: TableColGroupProps) => {
  return (
    <colgroup>
      {/* By position: the columns are the meta's, in its order, and never reordered. */}
      {colGroup.map((column, index) => {
        return <col key={index} style={column.style}/>
      })}
    </colgroup>
  )
}

export default TableColGroup;