import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
// Force form module to fully load before TableView pulls react-final-form-arrays through the cycle
import '../../../modules/form/utils'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'
import Table from '../../../components/Table'
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
    // The handlers are read off the object renderers receive, which is how the engine reaches them
    // (`onClick: 'handleItemExpand'` in meta). This used to take the class instance through a ref.
    let table
    const renderItem = item => <span data-testid='expanded'>{item.code}</span>
    const {queryAllByTestId} = render(withForm(
      <TableView
        items={[{code: 'Alpha'}, {code: 'Beta'}]}
        headers={[{id: 'code', renderCell: (value, index, props, self) => { table = self; return value }}]}
        renderItem={renderItem}
        {...defaults}
      />
    ))

    act(() => {
      table.handleItemExpand({key: 'code', value: 'BETA', expanded: true})
    })
    expect(queryAllByTestId('expanded').map(node => node.textContent)).toEqual(['Beta'])

    act(() => {
      table.handleToggleExpandAll(true)
    })
    expect(queryAllByTestId('expanded').map(node => node.textContent)).toEqual(['Alpha', 'Beta'])

    act(() => {
      table.handleToggleExpandAll()
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
    // The fourth argument is what the class passed as `this`: the engine reads `props` off it and
    // looks handlers up on it by name.
    expect(wrappedRender).toHaveBeenCalledWith(
      'raw',
      0,
      expect.objectContaining({expanded: undefined}),
      expect.objectContaining({
        props: expect.objectContaining({headers: expect.any(Array)}),
        handleItemExpand: expect.any(Function),
      })
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

describe('TableView state, caches and renderers', () => {
  const expandedTexts = container => Array.from(container.querySelectorAll('[data-testid="expanded"]'), node => node.textContent)
  const capture = () => {
    const received = []
    const headers = [{id: 'name', renderCell: (value, index, props, self) => { received.push(self); return value }}]
    return {received, headers, latest: () => received[received.length - 1]}
  }
  const renderExpanded = item => <span data-testid='expanded'>{item.name}</span>

  it('applies every expansion handler call made in one batch', () => {
    // THE ONE BEHAVIOUR CHANGE of §9.3 step 6 here. The class wrote a copy of `this.state` back, and
    // `this.state` does not move inside a batch, so of two expansions only the last survived, and a
    // toggle of every row was lost to an expansion batched after it. Measured on React 16, 17 and 18.
    const {headers, latest} = capture()
    const {container} = render(withForm(
      <TableView items={[{name: 'A'}, {name: 'B'}, {name: 'C'}]} headers={headers} renderItem={renderExpanded} {...defaults}/>
    ))

    act(() => {
      latest().handleItemExpand({index: 0, expanded: true})
      latest().handleItemExpand({index: 2, expanded: true})
    })
    expect(expandedTexts(container)).toEqual(['A', 'C'])

    act(() => {
      latest().handleToggleExpandAll(false)
      latest().handleItemExpand({index: 1, expanded: true})
    })
    expect(expandedTexts(container)).toEqual(['B'])
  })

  it('passes renderers one object for its lifetime, with the current props and the handlers', () => {
    // The engine reads `props.name` off it and looks handlers up on it by the name meta gives.
    const {received, headers, latest} = capture()
    const {container, rerender} = render(withForm(
      <TableView name="rows" items={[{name: 'A'}, {name: 'B'}]} headers={headers} renderItem={renderExpanded} {...defaults}/>
    ))
    rerender(withForm(
      <TableView name="rows" items={[{name: 'B'}, {name: 'A'}]} headers={headers} renderItem={renderExpanded} {...defaults}/>
    ))

    expect(new Set(received).size).toBe(1)
    expect(latest().props.items.map(item => item.name)).toEqual(['B', 'A'])
    act(() => latest().handleItemExpand({key: 'name', value: 'a', expanded: true}))
    // Found in the items the table has now, where `A` is the second row.
    expect(expandedTexts(container)).toEqual(['A'])
  })

  it('does not render again for a parent render with equal props', () => {
    let cells = 0
    const headers = [{id: 'name', renderCell: value => { cells += 1; return value }}]
    const items = [{name: 'A'}]
    let rerenderParent
    const Parent = () => {
      const [, setCount] = React.useState(0)
      rerenderParent = () => setCount(count => count + 1)
      return <TableView items={items} headers={headers} {...defaults}/>
    }
    render(withForm(<Parent/>))
    const mounted = cells

    act(() => rerenderParent())
    expect(cells).toBe(mounted)
  })

  it('keeps a clicked sort across parent renders that pass equal sorts', () => {
    // The mapper builds a new `sorts` array on every render; only a change by value resets the sort.
    const items = [{name: 'B'}, {name: 'A'}, {name: 'C'}]
    const tableWith = sorts => <TableView items={items} headers={[{id: 'name', label: 'Name'}]} sorts={sorts} {...defaults}/>
    const {container, getByText, rerender} = render(withForm(tableWith([{id: 'name', order: 1}])))

    fireEvent.click(getByText('Name').closest('.sort'))
    expect(bodyRowTexts(container)).toEqual(['B', 'A', 'C'])

    rerender(withForm(tableWith([{id: 'name', order: 1}])))
    expect(bodyRowTexts(container)).toEqual(['B', 'A', 'C'])
  })

  it('sorts again only when the items change element by element, as the class cached them', () => {
    const b = {name: 'B'}
    const c = {name: 'C'}
    const tableWith = rows => <TableView items={rows} headers={[{id: 'name'}]} sorts={[{id: 'name', order: 1}]} {...defaults}/>
    const {container, rerender} = render(withForm(tableWith([b, c])))

    // The same elements in a new array keep the rows as they were sorted, even though `b` changed.
    b.name = 'Z'
    rerender(withForm(tableWith([b, c])))
    expect(bodyRowTexts(container)).toEqual(['Z', 'C'])

    rerender(withForm(tableWith([b, {name: 'D'}])))
    expect(bodyRowTexts(container)).toEqual(['D', 'Z'])
  })

  it('keeps the headers it derived when the items become empty', () => {
    const {container, rerender} = render(withForm(<TableView items={[{a: 1, b: 2}]} {...defaults}/>))

    rerender(withForm(<TableView items={[]} {...defaults}/>))

    expect(Array.from(container.querySelectorAll('thead th'), cell => cell.textContent)).toEqual(['a', 'b'])
    expect(container).not.toHaveTextContent('Table has no data!')
  })

  it('keeps the chosen page when the items shrink below it, and then renders no rows', () => {
    // A CANDIDATE DEFECT, pinned rather than fixed: the page is never brought back into range.
    const scrollIntoView = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = () => {}
    try {
      const items = Array.from({length: 25}, (_, index) => ({name: `R${index}`}))
      const tableWith = rows => <TableView items={rows} headers={[{id: 'name'}]} usePagination rowsPerPage={10} {...defaults}/>
      const {container, getByLabelText, rerender} = render(withForm(tableWith(items)))

      fireEvent.click(getByLabelText('Page 3'))
      expect(bodyRowTexts(container)).toEqual(['R20', 'R21', 'R22', 'R23', 'R24'])

      rerender(withForm(tableWith(items.slice(0, 12))))
      expect(bodyRowTexts(container)).toEqual([])
    } finally {
      Element.prototype.scrollIntoView = scrollIntoView
    }
  })

  it('renders under StrictMode without a warning', () => {
    // The class drew React's StrictMode warning about `UNSAFE_componentWillReceiveProps`.
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<React.StrictMode>{withForm(<TableView items={[{name: 'A'}]} headers={[{id: 'name'}]} {...defaults}/>)}</React.StrictMode>)
      expect(errors).not.toHaveBeenCalled()
    } finally {
      errors.mockRestore()
    }
  })
})
