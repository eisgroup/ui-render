import React from 'react'
import {render} from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../../modules/form/utils'
import Render from '../../../ui-render'
import {FIELD} from '../../../modules/variables'
import {AppContext, ConfigContext, initialAppState, initialConfigState} from '../../../contexts'
import Data from '../Data'
import Expand from '../../../components/Expand'
import ProgressSteps from '../../../components/ProgressSteps'
import TooltipPop from '../../../components/TooltipPop'
import {renderField} from '../components/renders'
import TableView from '../components/TableView'
import '../mapper'

jest.mock('../Data', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

jest.mock('../../../components/Expand', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

jest.mock('../../../components/ProgressSteps', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

jest.mock('../../../components/TooltipPop', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

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

const popup = {setPopupState: jest.fn()}

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

const lastProps = mock => mock.mock.calls[mock.mock.calls.length - 1][0]

describe('mapper meta/data mapping contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    ['zero', 0],
    ['false', false],
    ['empty string', ''],
    ['null', null],
  ])('falls back to root data when the local Data value is %s', (_name, localData) => {
    // A nested render needs an object to bind its fields against. Handing a falsey scalar straight
    // through renders the whole block empty — its inputs never mount, so the user cannot fill them
    // and their keys never reach the submitted payload.
    const rootData = {fallback: true}

    renderMapped({
      view: FIELD.TYPE.DATA,
      kind: 'row',
      _data: localData,
      data: rootData,
    })

    expect(lastProps(Data).data).toBe(rootData)
  })

  it('uses root data only when local Data is absent', () => {
    const rootData = {fallback: true}

    renderMapped({
      view: FIELD.TYPE.DATA,
      kind: 'row',
      _data: undefined,
      data: rootData,
    })

    expect(lastProps(Data).data).toBe(rootData)
  })

  it('uses local data for a nameless showIf equality contract', () => {
    const visible = renderMapped({
      view: FIELD.TYPE.TEXT,
      children: 'visible-local-value',
      _data: 'enabled',
      showIf: {equal: 'enabled'},
    })
    expect(visible.getByText('visible-local-value')).toBeInTheDocument()

    const hidden = renderMapped({
      view: FIELD.TYPE.TEXT,
      children: 'hidden-local-value',
      _data: 'disabled',
      showIf: {equal: 'enabled'},
    })
    expect(hidden.container).toBeEmptyDOMElement()
  })

  it('falls back to root data when raw form data has a defensive non-object value', () => {
    const instance = {
      ...baseInstance(),
      getRawFormsData: () => 'invalid-form-snapshot',
    }

    const view = renderMapped({
      view: FIELD.TYPE.TEXT,
      children: 'root-fallback-visible',
      data: {enabled: true},
      showIf: {name: 'enabled'},
      instance,
    })

    expect(view.getByText('root-fallback-visible')).toBeInTheDocument()
  })

  it('builds a relative input name without an array index even when relative data is disabled', () => {
    renderMapped({
      view: FIELD.TYPE.INPUT,
      name: 'amount',
      relativePath: 'invoice.summary',
      relativeData: false,
      data: null,
    })

    expect(lastProps(renderField)).toEqual(expect.objectContaining({
      view: FIELD.TYPE.INPUT,
      id: 'invoice.summary.amount',
      name: 'invoice.summary.amount',
    }))
  })

  it('routes an unknown view with nested meta to the defensive field factory', () => {
    renderMapped({
      view: 'MissingView',
      data: null,
      items: [{view: FIELD.TYPE.TEXT, children: 'nested fallback'}],
    })

    const field = lastProps(renderField)
    expect(field.view).toBe('MissingView')
    expect(React.Children.count(field.children)).toBe(1)
    expect(field.readonly).toBeUndefined()
    expect(field.disabled).toBeUndefined()
  })

  it('keeps falsy values visible through the fallback for an unknown render method', () => {
    const fallback = Render.Method('MissingRenderer')
    const view = render(withProviders(fallback(0)))

    expect(view.container).toHaveTextContent('0')
  })

  it('maps object step, label and content definitions into ProgressSteps factories', () => {
    renderMapped({
      view: FIELD.TYPE.PROGRESS_STEPS,
      items: [
        {
          id: 'object-definitions',
          step: {view: FIELD.TYPE.TEXT, children: 'S1'},
          label: {view: FIELD.TYPE.TEXT, children: 'Object label'},
          content: {view: FIELD.TYPE.TEXT, children: 'Object content'},
        },
        {
          id: 'primitive-definitions',
          step: '2',
          label: 'Primitive label',
          content: 'Primitive content',
        },
      ],
    })

    const steps = lastProps(ProgressSteps).items
    expect(React.isValidElement(steps[0].step)).toBe(true)
    expect(React.isValidElement(steps[0].label)).toBe(true)
    expect(steps[0].content).toEqual(expect.any(Function))
    expect(steps[1]).toEqual(expect.objectContaining({
      step: '2',
      label: 'Primitive label',
      content: 'Primitive content',
    }))

    expect(React.isValidElement(steps[0].content())).toBe(true)
  })

  it('converts an Expand label to title and lazily renders nested meta items', () => {
    renderMapped({
      view: FIELD.TYPE.EXPAND,
      label: 'Details',
      items: [{view: FIELD.TYPE.TEXT, children: 'Lazy details'}],
    })

    const expand = lastProps(Expand)
    expect(expand.title).toBe('Details')
    expect(expand.label).toBeUndefined()
    expect(expand.children).toEqual(expect.any(Function))

    const children = render(withProviders(<>{expand.children()}</>))
    expect(children.getByText('Lazy details')).toBeInTheDocument()
  })

  it('uses nested meta items as Button content', () => {
    const view = renderMapped({
      view: FIELD.TYPE.BUTTON,
      items: [{view: FIELD.TYPE.TEXT, children: 'Nested button content'}],
    })

    expect(view.getByRole('button')).toHaveTextContent('Nested button content')
  })

  it('maps tooltip label rendering and an object trigger from meta', () => {
    const renderLabel = jest.fn(value => `Formatted ${value}`)
    renderMapped({
      view: FIELD.TYPE.TOOLTIP,
      label: 'hint',
      renderLabel,
      children: {view: FIELD.TYPE.TEXT, children: 'Object trigger'},
    })

    const tooltip = lastProps(TooltipPop)
    expect(tooltip.content).toBe('Formatted hint')
    expect(tooltip.label).toBeUndefined()
    expect(tooltip.renderLabel).toBeUndefined()
    expect(React.isValidElement(tooltip.children)).toBe(true)
    expect(renderLabel).toHaveBeenCalledWith('hint')
  })

  it('executes stored static popup content as a recursive component factory', () => {
    const instance = baseInstance()
    renderMapped({
      view: FIELD.TYPE.POPUP,
      id: 'details',
      items: [{view: FIELD.TYPE.TEXT, children: 'Stored popup content'}],
      instance,
    })

    const popupContent = render(withProviders(instance.popupById.details.content))
    expect(popupContent.getByText('Stored popup content')).toBeInTheDocument()
  })

  it('executes a custom table-row view factory with its invocation props', () => {
    renderMapped({
      view: FIELD.TYPE.TABLE,
      _data: [],
      extraItems: [{custom: {view: FIELD.TYPE.TEXT, children: 'Custom row'}}],
    })

    const custom = lastProps(TableView).items[0].custom
    const customElement = custom(null, 3, {data: {id: 3}, marker: 'row-props'})
    const customView = render(withProviders(customElement))

    expect(customView.getByText('Custom row')).toBeInTheDocument()
  })

  it('normalizes malformed table data and keeps an absent field-array name absent', () => {
    renderMapped({
      view: FIELD.TYPE.TABLE,
      _data: {not: 'a list'},
    })

    expect(lastProps(TableView)).toEqual(expect.objectContaining({
      items: [],
      fieldArrayName: undefined,
    }))
  })

  it('renders nested Text items before renderLabel and maps renderLabel when no items exist', () => {
    const ignoredRenderLabel = jest.fn(() => 'ignored')
    const nested = renderMapped({
      view: FIELD.TYPE.TEXT,
      items: [{view: FIELD.TYPE.TEXT, children: 'Nested text'}],
      children: 'raw',
      renderLabel: ignoredRenderLabel,
    })
    expect(nested.getByText('Nested text')).toBeInTheDocument()
    expect(ignoredRenderLabel).not.toHaveBeenCalled()

    const formatted = renderMapped({
      view: FIELD.TYPE.TEXT,
      children: 'raw',
      renderLabel: value => `Formatted ${value}`,
    })
    expect(formatted.getByText('Formatted raw')).toBeInTheDocument()
  })
})
