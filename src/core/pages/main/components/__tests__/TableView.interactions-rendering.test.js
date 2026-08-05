import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
// Force form module to fully load before TableView pulls react-final-form-arrays through the cycle
import '../../../../modules/form/utils'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'
import Table from '../../../../components/Table'
import TableView from '../TableView'

const defaults = {
  additionalCellsStyles: [],
  translate: value => value,
}

const withForm = (ui, {
  initialValues = {},
  includeMutators = true,
  captureForm,
} = {}) => (
  <ConfigContext.Provider value={initialConfigState}>
    <Form
      onSubmit={() => {}}
      {...(includeMutators ? {mutators: {...arrayMutators}} : {})}
      initialValues={initialValues}
      render={({form}) => {
        captureForm && captureForm(form)
        return ui
      }}
    />
  </ConfigContext.Provider>
)

const bodyRowTexts = container => Array.from(container.querySelectorAll('tbody > tr'), row => row.textContent)

describe('TableView additional contracts', () => {
  it('sorts by a descending nested key without mutating the source rows', () => {
    const items = [
      {label: 'first', profile: {name: 'Ada'}},
      {label: 'second', profile: {name: 'Zoe'}},
      {label: 'third', profile: {name: 'Mia'}},
    ]
    const originalOrder = items.slice()

    const {container} = render(withForm(
      <TableView
        items={items}
        headers={[{id: 'profile', renderCell: profile => profile.name}]}
        sorts={[
          {id: 'profile', sortKey: 'name', order: -1},
          {id: 'ignored', order: 0},
        ]}
        {...defaults}
      />
    ))

    expect(bodyRowTexts(container)).toEqual(['Zoe', 'Mia', 'Ada'])
    expect(items).toEqual(originalOrder)
    expect(items[0]).toBe(originalOrder[0])
  })

  it('cycles a sort through descending, ascending and inactive while preserving sibling sorts', () => {
    const onSort = jest.fn()
    const {getByText} = render(withForm(
      <TableView
        items={[
          {name: 'Beta', rank: 2},
          {name: 'Alpha', rank: 1},
        ]}
        headers={[
          {id: 'name', label: 'Name'},
          {id: 'rank', label: 'Rank'},
        ]}
        sorts={[
          {id: 'name', order: 0},
          {id: 'rank', order: 1},
        ]}
        onSort={onSort}
        {...defaults}
      />
    ))
    const nameSort = getByText('Name').closest('.sort')

    fireEvent.click(nameSort)
    fireEvent.click(nameSort)
    fireEvent.click(nameSort)

    expect(onSort.mock.calls.map(([sort]) => sort)).toEqual([
      {id: 'name', order: -1},
      {id: 'name', order: 1},
      {id: 'name', order: 0},
    ])
  })

  it('invalidates derived headers and sorted rows when item shape and sorts change', () => {
    const first = (
      <TableView
        items={[{name: 'Beta'}, {name: 'Alpha'}]}
        sorts={[{id: 'name', order: 1}]}
        {...defaults}
      />
    )
    const {container, rerender} = render(withForm(first))
    expect(bodyRowTexts(container)).toEqual(['Alpha', 'Beta'])

    rerender(withForm(
      <TableView
        items={[{title: 'Alpha'}, {title: 'Zulu'}]}
        sorts={[{id: 'title', order: -1}]}
        {...defaults}
      />
    ))

    expect(Array.from(container.querySelectorAll('thead th'), cell => cell.textContent)).toEqual(['title'])
    expect(bodyRowTexts(container)).toEqual(['Zulu', 'Alpha'])
  })

  it('finds an expansion target by key and toggles all rows with explicit and implicit state', () => {
    const tableRef = React.createRef()
    const renderItem = item => <span data-testid='expanded'>{item.code}</span>
    const {queryAllByTestId} = render(withForm(
      <TableView
        ref={tableRef}
        items={[{code: 'Alpha'}, {code: 'Beta'}]}
        headers={[{id: 'code'}]}
        renderItem={renderItem}
        {...defaults}
      />
    ))

    act(() => {
      tableRef.current.handleItemExpand({key: 'code', value: 'BETA', expanded: true})
    })
    expect(queryAllByTestId('expanded').map(node => node.textContent)).toEqual(['Beta'])

    act(() => {
      tableRef.current.handleToggleExpandAll(true)
    })
    expect(queryAllByTestId('expanded').map(node => node.textContent)).toEqual(['Alpha', 'Beta'])

    act(() => {
      tableRef.current.handleToggleExpandAll()
    })
    expect(queryAllByTestId('expanded')).toHaveLength(0)
  })

  it('changes the visible page, scrolls to the table and gives the extra row the full collection', () => {
    const items = Array.from({length: 23}, (_, index) => ({name: `R${index}`}))
    const renderExtraItem = jest.fn((allRows, index) => (
      <Table.Cell data-testid='extra-row'>{`Draft ${index}`}</Table.Cell>
    ))
    const {container, getByLabelText} = render(withForm(
      <TableView
        items={items}
        headers={[{id: 'name'}]}
        usePagination
        rowsPerPage={10}
        renderExtraItem={renderExtraItem}
        {...defaults}
      />
    ))
    const scrollIntoView = jest.fn()
    container.firstElementChild.scrollIntoView = scrollIntoView

    expect(bodyRowTexts(container)).toEqual([
      'R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'Draft 23',
    ])
    expect(renderExtraItem).toHaveBeenLastCalledWith(items, 23)

    fireEvent.click(getByLabelText('Page 2'))

    expect(scrollIntoView).toHaveBeenCalledWith({behavior: 'smooth', block: 'start'})
    expect(bodyRowTexts(container)).toEqual([
      'R10', 'R11', 'R12', 'R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19', 'Draft 23',
    ])
    expect(renderExtraItem).toHaveBeenLastCalledWith(items, 23)
  })

  it('registers an explicit fieldArrayName instead of the display name', () => {
    let formApi
    render(withForm(
      <TableView
        items={[{name: 'Draft'}]}
        headers={[{id: 'name'}]}
        name='visibleRows'
        fieldArrayName='draftRows'
        {...defaults}
      />,
      {
        initialValues: {draftRows: [{name: 'Draft'}]},
        captureForm: form => { formApi = form },
      }
    ))

    expect(formApi.getRegisteredFields()).toContain('draftRows')
    expect(formApi.getRegisteredFields()).not.toContain('visibleRows')
  })

  it('surfaces the field-array configuration error when array mutators are absent', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    try {
      expect(() => render(withForm(
        <TableView
          items={[{name: 'Draft'}]}
          headers={[{id: 'name'}]}
          name='draftRows'
          {...defaults}
        />,
        {includeMutators: false}
      ))).toThrow(/Array mutators not found/)
    } finally {
      consoleError.mockRestore()
    }
  })

  it('renders the no-data placeholder when neither rows nor explicit headers exist', () => {
    const {getByText, queryByRole} = render(withForm(
      <TableView items={[]} {...defaults} />
    ))

    expect(getByText('Table has no data!')).toBeInTheDocument()
    expect(queryByRole('table')).not.toBeInTheDocument()
  })

  it('handles null row-class values and renders wrapped data, dates and plain objects safely', () => {
    const wrappedRender = jest.fn(value => `seen:${value}`)
    const {container, getByText} = render(withForm(
      <TableView
        items={[{
          status: null,
          recordedAt: new Date(Date.UTC(2026, 6, 31)),
          config: {a: 1},
          wrapped: {data: 'raw', render: wrappedRender},
        }]}
        headers={[
          {id: 'status'},
          {id: 'recordedAt'},
          {id: 'config'},
          {id: 'wrapped'},
        ]}
        itemClassNames={[
          {id: 'status', values: {active: 'active-row'}},
          {id: 'config.a', values: {2: 'matched-row'}},
        ]}
        {...defaults}
      />
    ))

    const row = container.querySelector('tbody > tr')
    expect(row).not.toHaveClass('active-row')
    expect(row).not.toHaveClass('matched-row')
    expect(getByText('07-31-2026')).toBeInTheDocument()
    expect(getByText('{"a":1}')).toBeInTheDocument()
    expect(getByText('seen:raw')).toBeInTheDocument()
    expect(wrappedRender).toHaveBeenCalledWith(
      'raw',
      0,
      expect.objectContaining({expanded: undefined}),
      expect.any(TableView)
    )
  })

  it('applies sticky boundaries in vertical layout and renders a column group', () => {
    // TableColGroup has a known missing-key warning; it is outside this TableView contract.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    let container
    try {
      ;({container} = render(withForm(
        <TableView
          items={[{name: 'Alpha'}, {name: 'Beta'}]}
          headers={[{id: 'name', classNameHeader: 'frozen'}]}
          vertical
          colGroup={[
            {style: {width: '100px'}},
            {style: {width: '80px'}},
            {style: {width: '80px'}},
          ]}
          additionalCellsStyles={[
            {position: 'sticky', left: 0},
            {position: 'sticky', left: 100},
            {},
          ]}
          translate={defaults.translate}
        />
      )))
    } finally {
      consoleError.mockRestore()
    }

    expect(container.querySelector('colgroup')).toBeInTheDocument()
    expect(container.querySelector('col')).toHaveStyle({width: '100px'})
    expect(container.querySelector('tbody th')).toHaveClass('frozen', 'sticky')
    expect(container.querySelector('tbody td')).toHaveClass('sticky-last')
  })

  it('passes explicit header data to function children', () => {
    const header = {
      id: 'name',
      data: 'Heading',
      children: (value, id) => <span data-testid='functional-header'>{`${value}:${id}`}</span>,
    }
    const {getByTestId} = render(withForm(
      <TableView
        items={[{name: 'Alpha'}]}
        headers={[header]}
        {...defaults}
      />
    ))

    expect(getByTestId('functional-header')).toHaveTextContent('Heading:name')
  })
})
