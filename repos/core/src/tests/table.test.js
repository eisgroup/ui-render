import { render, screen } from '@testing-library/react'
import React from 'react'
import TableView from 'ui-react-pack/TableView'

// Setup test
beforeEach(() => {
  // jest.useFakeTimers()
})

// Cleanup test
afterEach(() => {
  // jest.runOnlyPendingTimers()
  // jest.useRealTimers()
})

describe(`<${TableView.name}/>`, () => {
  const id1 = 1
  const id2 = 2
  const name1 = 'First'
  const name2 = 'Second'
  const label1 = 'Label1'
  const label2 = 'Label2'
  const item1 = {id: id1, name: name1, label: label1}
  const item2 = {id: id2, name: name2, label: label2}
  const items = [item1, item2]
  it(`renders items without defining headers`, () => {
    render(<TableView items={items}/>)
    expect(screen.getByText(String(id1))).toBeInTheDocument()
    expect(screen.getByText(String(id2))).toBeInTheDocument()
    expect(screen.getByText(name1)).toBeInTheDocument()
    expect(screen.getByText(name2)).toBeInTheDocument()
    expect(screen.getByText(label1)).toBeInTheDocument()
    expect(screen.getByText(label2)).toBeInTheDocument()
  })
  it(`renders only items defined in headers`, () => {
    const headers = [{id: 'name'}]
    render(<TableView items={items} headers={headers}/>)
    expect(screen.queryByText(String(id1))).toBeNull()
    expect(screen.queryByText(String(id2))).toBeNull()
    expect(screen.getByText(name1)).toBeInTheDocument()
    expect(screen.getByText(name2)).toBeInTheDocument()
    expect(screen.queryByText(label1)).toBeNull()
    expect(screen.queryByText(label2)).toBeNull()
  })
  it(`applies header attributes`, () => {
    const label = 'Name'
    const className = 'padding-h'
    const classNameCell = 'padding-v'
    const classNameCellWrap = 'margin-h'
    const color = 'red'
    const background = 'blue'
    const style = {color}
    const styleCell = {background}
    const headers = [{id: 'name', label, className, classNameCell, classNameCellWrap, style, styleCell}]
    render(<TableView items={items} headers={headers}/>)
    const cellHeaderContent = screen.getByText(label)
    const cell = screen.getByText(name1)
    expect(cellHeaderContent).toBeInTheDocument()
    expect(cellHeaderContent.parentElement).toHaveClass(className)
    expect(cellHeaderContent.parentElement).toHaveStyle(`color: ${color}`)
    expect(cell).toBeInTheDocument()
    expect(cell.parentElement).toHaveStyle(`background: ${background}`)
    expect(cell.parentElement).toHaveClass(classNameCell)
    expect(cell.parentElement.parentElement).toHaveClass(classNameCellWrap)
  })
  it(`overrides header 'label' with 'children' when given`, () => {
    const label = 'Name'
    const children = 'children'
    const headers = [{id: 'name', label, children}]
    render(<TableView items={items} headers={headers}/>)
    expect(screen.queryByText(label)).toBeNull()
    expect(screen.getByText(children)).toBeInTheDocument()
  })
  test(`header 'renderCell' works with custom function`, () => {
    const result = 'renderCell.value'
    const renderCell = () => result
    const headers = [{id: 'name', renderCell}]
    render(<TableView items={items} headers={headers}/>)
    expect(screen.queryByText(name1)).toBeNull() // item value that is replaced with `renderCell`
    expect(screen.getAllByText(result)[0]).toBeInTheDocument()
  })
  describe(`renderItem`, () => {
    const suffix = 'Suffix'
    const itemLabel1 = label1 + suffix
    const itemLabel2 = label2 + suffix
    const renderItem = (item) => item.label + suffix
    const headers = [{id: 'name'}]
    test(`outputs extra row in default layout when expanded`, () => {
      render(<TableView items={items} headers={headers} renderItem={renderItem} itemsExpanded/>)
      expect(screen.getByText(itemLabel1)).toBeInTheDocument()
      expect(screen.getByText(itemLabel2)).toBeInTheDocument()
    })
    test(`outputs nothing when items are collapsed`, () => {
      render(<TableView items={items} headers={headers} renderItem={renderItem} itemsExpanded={false}/>)
      expect(screen.queryByText(itemLabel1)).toBeNull()
      expect(screen.queryByText(itemLabel2)).toBeNull()
    })
  })
})
