import React from 'react'

const TableColGroup = ({ colGroup }) => {
  return (
    <colgroup>
      {colGroup.map(column => {
        return <col style={column.style}/>
      })}
    </colgroup>
  )
}

export default TableColGroup;