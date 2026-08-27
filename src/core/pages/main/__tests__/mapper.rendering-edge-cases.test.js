import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../../modules/form/utils'
import Render from '../../../ui-render'
import { FIELD } from '../../../modules/variables'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../../contexts'
import AutoSave from '../../../modules/form/views/AutoSave'
import Dropdown from '../../../components/Dropdown'
import PieChart from '../../../components/charts/PieChart'
import { renderField } from '../components/renders'
import TableView from '../components/TableView'
import '../mapper'

jest.mock('../components/renders', () => {
  const {Active} = jest.requireActual('../../../utils')
  const mockedRenderField = jest.fn(() => null)
  Active.renderField = mockedRenderField
  return {
    __esModule: true,
    renderField: mockedRenderField,
  }
})

jest.mock('../components/TableView', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

jest.mock('../../../components/Dropdown', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

jest.mock('../../../components/charts/PieChart', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

jest.mock('../../../modules/form/views/AutoSave', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

const popup = {
  setPopupState: jest.fn(),
}

const withProviders = ui => (
  <ConfigContext.Provider value={initialConfigState}>
    <AppContext.Provider value={{...initialAppState, popup}}>
      {ui}
    </AppContext.Provider>
  </ConfigContext.Provider>
)

const baseInstance = () => ({
  state: {},
  submit: jest.fn(),
})

const mappedElement = (props = {}) => {
  const instance = props.instance || baseInstance()
  const hasExplicitForm = Object.prototype.hasOwnProperty.call(props, 'form')
  const form = hasExplicitForm ? props.form : {change: jest.fn()}
  return {
    element: withProviders(
      <Render.Component
        view={FIELD.TYPE.TEXT}
        items={[]}
        data={{}}
        {...props}
        instance={instance}
        form={form}
      />
    ),
    form,
    instance,
  }
}

const renderMapped = (props = {}) => {
  const mapped = mappedElement(props)
  return {...render(mapped.element), form: mapped.form, instance: mapped.instance}
}

const lastCallProps = mock => mock.mock.calls[mock.mock.calls.length - 1][0]
const lastFieldProps = () => lastCallProps(renderField)
const lastTableProps = () => lastCallProps(TableView)

describe('mapper edge contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('resolves relative, root and interpolated showIf paths from live form data', () => {
    const instance = {
      ...baseInstance(),
      state: {flag: 'enabled'},
      getRawFormsData: () => ({
        sections: [{enabled: false}, {enabled: true}],
        flags: {enabled: true},
      }),
    }

    const visibleRelative = renderMapped({
      view: FIELD.TYPE.TEXT,
      children: 'relative-visible',
      relativePath: 'sections',
      relativeIndex: 1,
      showIf: {name: 'enabled'},
      instance,
    })
    expect(visibleRelative.getByText('relative-visible')).toBeInTheDocument()

    const hiddenRelative = renderMapped({
      view: FIELD.TYPE.TEXT,
      children: 'relative-hidden',
      relativePath: 'sections',
      relativeIndex: 0,
      showIf: {name: 'enabled'},
      instance,
    })
    expect(hiddenRelative.container).toBeEmptyDOMElement()

    const visibleRoot = renderMapped({
      view: FIELD.TYPE.TEXT,
      children: 'root-visible',
      relativePath: 'sections',
      relativeIndex: 0,
      showIf: {name: 'flags.{state.flag}', relativeData: false},
      instance,
    })
    expect(visibleRoot.getByText('root-visible')).toBeInTheDocument()
  })

  it('supports the empty-object showIf shorthand against local row data', () => {
    const hidden = renderMapped({
      view: FIELD.TYPE.TEXT,
      children: 'hidden',
      showIf: {},
      _data: null,
    })
    expect(hidden.container).toBeEmptyDOMElement()

    const visible = renderMapped({
      view: FIELD.TYPE.TEXT,
      children: 'visible',
      showIf: {},
      _data: {id: 1},
    })
    expect(visible.getByText('visible')).toBeInTheDocument()
  })

  it('inherits row paths in TableCells without overwriting explicit child context', () => {
    const mapped = mappedElement({
      view: FIELD.TYPE.TABLE_CELLS,
      relativePath: 'orders.lines',
      relativeIndex: 3,
      items: [
        {view: FIELD.TYPE.INPUT, name: 'amount'},
        {
          view: FIELD.TYPE.INPUT,
          name: 'status',
          relativePath: 'custom.rows',
          relativeIndex: 7,
        },
      ],
    })
    render(<table><tbody><tr>{mapped.element}</tr></tbody></table>)

    expect(renderField.mock.calls.map(([props]) => props.name)).toEqual([
      'orders.lines[3].amount',
      'custom.rows[7].status',
    ])
  })

  it('re-resolves table extraItems on rerender without mutating the meta definition', () => {
    const extraItems = [{summary: {name: 'shared.label'}}]
    const originalDefinition = [{summary: {name: 'shared.label'}}]
    const instance = baseInstance()
    const form = {change: jest.fn()}
    const props = label => ({
      view: FIELD.TYPE.TABLE,
      items: [],
      name: 'rows',
      relativePath: 'sections',
      relativeIndex: 2,
      data: {shared: {label}},
      _data: [],
      extraItems,
      instance,
      form,
    })
    const {rerender} = renderMapped(props('First'))

    expect(lastTableProps().fieldArrayName).toBe('sections.2.rows')
    expect(lastTableProps().items).toEqual([{summary: 'First'}])
    expect(extraItems).toEqual(originalDefinition)

    rerender(mappedElement(props('Second')).element)

    expect(lastTableProps().items).toEqual([{summary: 'Second'}])
    expect(extraItems).toEqual(originalDefinition)
  })

  it('reports a non-object grouped-table label map through the error popup', () => {
    renderMapped({
      view: FIELD.TYPE.TABLE,
      name: 'rows',
      _data: [{period: 'Jan', region: 'EU', amount: 10}],
      headers: [{id: 'amount'}],
      group: {
        by: {id: 'region', label: 'not-a-label-map'},
        header: {id: 'period'},
      },
    })

    expect(popup.setPopupState).toHaveBeenCalledTimes(1)
    expect(popup.setPopupState).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Incorrect config for Table with {name: "rows"}!',
      content: expect.stringContaining('group.by.label must resolve to object'),
    }))
  })

  it('maps PieChart data and nested center content from meta', () => {
    renderMapped({
      view: FIELD.TYPE.PIE_CHART,
      _data: [
        {category: 'Open', amount: 3},
        {category: 'Closed', amount: 7},
      ],
      mapItems: {label: 'category', value: 'amount'},
      items: [{view: FIELD.TYPE.TEXT, children: 'Center'}],
    })

    const pie = lastCallProps(PieChart)
    expect(pie.items).toEqual([
      {label: 'Open', value: 3},
      {label: 'Closed', value: 7},
    ])
    expect(React.Children.count(pie.children)).toBe(1)
    expect(pie.mapItems).toBeUndefined()
  })

  it('keeps Dropdown callback values isolated from adapter event arguments', () => {
    const onChange = jest.fn()
    renderMapped({
      view: FIELD.TYPE.DROPDOWN,
      name: 'choice',
      relativePath: 'rows',
      relativeIndex: 4,
      onChange,
    })
    const dropdown = lastCallProps(Dropdown)

    expect(dropdown.name).toBe('rows[4].choice')
    expect(dropdown.lazyLoad).toBe(false)
    dropdown.onChange('selected', {synthetic: true})
    expect(onChange.mock.calls[0]).toEqual(['selected'])
  })

  it('preserves index-based Select callbacks instead of remapping an already stable value', () => {
    const onChange = jest.fn()
    renderMapped({
      view: FIELD.TYPE.SELECT,
      name: 'choice',
      options: [{label: 'First'}, {label: 'Second'}],
      mapOptions: {text: 'label', value: '{index}'},
      onChange,
    })
    const field = lastFieldProps()

    expect(field.options).toEqual([
      {text: 'First', value: '0'},
      {text: 'Second', value: '1'},
    ])
    field.onChange('1', 'event-payload')
    expect(onChange.mock.calls[0]).toEqual(['1', 'event-payload'])
  })

  it('keeps removable auto-submit actions safe when a Form API is unavailable', () => {
    jest.useFakeTimers()
    const instance = baseInstance()
    const onRemove = jest.fn()
    renderMapped({
      view: FIELD.TYPE.INPUT,
      name: 'comment',
      removable: true,
      autoSubmit: {delay: -1},
      onRemove,
      form: undefined,
      instance,
    })
    const field = lastFieldProps()

    field.onChange('draft')
    jest.runOnlyPendingTimers()
    expect(instance.submit).toHaveBeenCalledTimes(1)

    expect(() => field.onClickIcon()).not.toThrow()
    jest.runOnlyPendingTimers()
    expect(onRemove).toHaveBeenCalledWith('comment')
    expect(instance.submit).toHaveBeenCalledTimes(2)
  })

  it('maps nested input icons and AutoSubmit actions to their concrete components', () => {
    renderMapped({
      view: FIELD.TYPE.INPUT,
      name: 'query',
      icon: {view: FIELD.TYPE.ICON, name: 'search'},
    })
    const icon = lastFieldProps().icon
    expect(React.isValidElement(icon)).toBe(true)
    expect(icon.props).toEqual(expect.objectContaining({view: FIELD.TYPE.ICON, name: 'search'}))

    renderMapped({
      view: FIELD.TYPE.AUTO_SUBMIT,
      delay: 25,
      disabled: true,
    })
    // Assert on the props argument alone: the second argument React passes to function
    // components is version-specific (legacy context object on 16-18, `undefined` on 19).
    expect(AutoSave).toHaveBeenCalledTimes(1)
    expect(AutoSave.mock.calls[0][0]).toEqual(expect.objectContaining({delay: 25, disabled: true}))
  })

  it('returns null from numeric render methods for malformed values', () => {
    expect(Render.Method(FIELD.RENDER.DOUBLE5)('not-a-number')).toBeNull()
    expect(Render.Method(FIELD.RENDER.FLOAT)('not-a-number')).toBeNull()
    expect(Render.Method(FIELD.RENDER.PERCENT)('not-a-number')).toBeNull()
    expect(React.isValidElement(Render.Method(FIELD.RENDER.FLOAT)(1.25))).toBe(true)
  })
})
