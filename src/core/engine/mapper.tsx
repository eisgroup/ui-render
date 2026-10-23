import React, { memo, useContext } from 'react'
import { registrationsOf } from '../modules/form/batchedForm'
import AutoSave from '../modules/form/views/AutoSave'
import { FIELD } from '../modules/variables'
import { cn } from '../components'
import Button from '../components/Button'
import PieChart from '../components/charts/PieChart'
import { Checkbox } from '../components/Checkbox'
import Counter from '../components/Counter'
import Dropdown from '../components/Dropdown'
import Expand from '../components/Expand'
import ExpandList from '../components/ExpandList'
import Icon from '../components/Icon'
import Image from '../components/Image'
import { OK } from '../components/inputs/validationRules'
import Label from '../components/Label'
import List from '../components/List'
import TextDateValue from '../components/TextDateValue'
import ProgressSteps from '../components/ProgressSteps'
import { renderFloat } from '../components/renders'
import Row from '../components/Row'
import Space from '../components/Space'
import Table from '../components/Table'
import Text from '../components/Text'
import Tooltip from '../components/Tooltip'
import { useBracket } from '../components/useBracket'
import View from '../components/View'
import { Active, isList, isNumeric, toFlatList, toJSON } from '../utils'
import { TIME_DURATION_INSTANT } from '../utils/constants'
import { get, hasObjectValue, isObject } from '../utils/object'
import { autoSubmitter } from './autoSubmit'
import { shouldRender } from './showIf'
import Render, { formatRenderError, mapProps } from './index'
import { isUnnamedField, relativePathFrom } from './transforms'
import { renderField } from './components/renders'
import TableView from './components/TableView'
import TabList from './components/TabList'
import Tabs from './components/Tabs'
import Data from './Data'
import { AppContext, TableColumnsContext } from '../contexts'
import type { RenderErrorReport } from './Render'

/**
 * A meta node's attributes, as the mapper receives them from `Render`. `any`, deliberately: they are
 * open JSON, which `validateMeta` checks at runtime and the published contract types describe, and
 * each case below hands them on, unchecked, to the view the node names. What a view requires (a
 * `Data` block's `kind`, a `List`'s `renderItem`) is the meta's to supply, so a narrower type here
 * would be a claim the compiler cannot check, about data it never sees.
 */
type MetaAttributes = any

/** What a value renderer is handed after the value and its index: the node's own options. */
type RenderMethodOptions = Record<string, any>

/** A field's validator, as a number field's bounds call it: with the value alone. */
type FieldValidator = (value: any) => unknown

/**
 * THE VALIDATOR A NUMBER FIELD'S `min` AND `max` ADD, kept per document while they stay the same
 * (2026-10-12).
 *
 * A number field with `min` or `max` had its `validate` wrapped in a new function on every render. A
 * field takes it as a prop, so the field host's memo saw a changed prop on every render of the
 * document: every such field rendered again on each change, a blur included, which was all 400 number
 * fields of a 200-row table for one blur. The same bounds over the same own `validate` give the same
 * function now, as a `verify`'s rules do (`keptVerify` in `transforms.ts`). A bound that is not a
 * number, a string, a boolean or nothing still makes a new one on each render.
 */
const keptBounds = new WeakMap<object, Map<string, { withoutOwn?: FieldValidator, byOwn: WeakMap<object, FieldValidator> }>>()

/** How many sets of bounds one document keeps. A host that keeps changing a document's meta starts over past it. */
const KEPT_BOUNDS_LIMIT = 64

/** A field's bounds as a key, or `undefined` when one of them is a value a key would not tell apart. */
function boundsKey (min: unknown, max: unknown): string | undefined {
    const part = (bound: unknown) => {
        if (bound == null) return 'none'
        if (typeof bound === 'number' || typeof bound === 'boolean' || typeof bound === 'string') return [typeof bound, String(bound)]
        return undefined
    }
    const low = part(min)
    const high = part(max)
    return low === undefined || high === undefined ? undefined : JSON.stringify([low, high])
}

/** A field's event handler, as the mapper wraps it. */
type FieldHandler = (...args: any[]) => unknown

/**
 * THE HANDLERS `autoSubmit` AND `removable` ADD TO A FIELD, kept per document while what they call
 * stays the same (2026-10-12).
 *
 * Each wrapped the field's own handler in a new function on every render. The field host's memo saw a
 * changed prop on every render of the document, so the field rendered again on each change to any
 * other field, a blur included. A wrapper is now the same function for as long as everything it calls
 * is the same: it is kept per document and field name, and made again only when one of those changes.
 * A field without a name, whose slot could not be told from another's, still gets a new one each render.
 */
const keptHandlers = new WeakMap<object, Map<string, { calls: unknown[], handler: FieldHandler }>>()

/** How many wrapped handlers one document keeps. A document that keeps adding fields starts over past it. */
const KEPT_HANDLERS_LIMIT = 1024

/** The slot a field's wrapped handler is kept in, or `undefined` for a field without a name. */
const handlerSlot = (kind: string, name: unknown): string | undefined =>
    typeof name === 'string' && name !== '' ? `${kind}:${name}` : undefined

/** What `make` returns, or what it returned before for this slot while it would call the very same things. */
function keptHandler (instance: unknown, slot: string | undefined, calls: unknown[], make: () => FieldHandler): FieldHandler {
    if (instance === null || typeof instance !== 'object' || slot === undefined) return make()
    let bySlot = keptHandlers.get(instance)
    if (!bySlot) {
        bySlot = new Map()
        keptHandlers.set(instance, bySlot)
    }
    const kept = bySlot.get(slot)
    if (kept && kept.calls.length === calls.length && kept.calls.every((call, i) => Object.is(call, calls[i]))) return kept.handler
    const handler = make()
    if (!kept && bySlot.size >= KEPT_HANDLERS_LIMIT) bySlot.clear()
    bySlot.set(slot, { calls, handler })
    return handler
}

/**
 * THE OPTIONS A `mapOptions` MAPS, kept while they are mapped from the same options by the same mapping
 * (2026-10-12).
 *
 * The mapper mapped a field's `options` through its `mapOptions` on every render, so the field was
 * handed a new array each time. A Select, which takes them as a prop, rendered again on every render of
 * its document: on each change of any other field, a blur included. `toOpenLConfig` gives a named Select
 * with no `onChange` of its own a `mapOptions` whenever its options are not a declared option list, so
 * many Selects did. The mapped array is now kept while the options array and the
 * `mapOptions` are the very ones it was mapped from. Both come from the document's meta, which is built
 * again when the document's state changes (`meta` in `rules.tsx`), and a meta built again is mapped
 * again. The array is shared between those renders: nothing that takes it changes it, and `Dropdown`
 * keys its reset on the options' values, not on the array.
 */
const keptOptions = new WeakMap<object, Map<unknown, { debug: unknown, options: unknown[] }>>()

/** What a field with `mapOptions` and no `options` is handed: an empty list maps to an empty list, whatever the mapping. */
const NO_OPTIONS: unknown[] = []

/** `mapProps(options, mapOptions)`, or the array it gave before for the very same options and mapping. */
function keptMappedOptions (options: unknown, mapOptions: any, debug: unknown): unknown[] {
    if (!options) return NO_OPTIONS
    const source = options
    if (typeof source !== 'object') return mapProps(source, mapOptions, { debug: debug as boolean })
    let byMapping = keptOptions.get(source)
    if (!byMapping) {
        byMapping = new Map()
        keptOptions.set(source, byMapping)
    }
    const kept = byMapping.get(mapOptions)
    if (kept && kept.debug === debug) return kept.options
    const mapped = mapProps(source, mapOptions, { debug: debug as boolean })
    byMapping.set(mapOptions, { debug, options: mapped })
    return mapped
}

/** `validate` with a number field's bounds checked first, the same function while all three stay the same. */
function boundedValidator (instance: unknown, validate: FieldValidator | undefined, min: any, max: any): FieldValidator {
    const bounded: FieldValidator = (value: any) => {
        if (min != null && value < min) return `Must be minimum ${min}`
        if (max != null && value > max) return `Must be maximum ${max}`
        return (validate && validate(value)) || OK
    }
    const key = instance !== null && typeof instance === 'object' ? boundsKey(min, max) : undefined
    if (key === undefined || (validate != null && typeof validate !== 'function')) return bounded
    let byBounds = keptBounds.get(instance as object)
    if (!byBounds) {
        byBounds = new Map()
        keptBounds.set(instance as object, byBounds)
    }
    let kept = byBounds.get(key)
    if (!kept) {
        if (byBounds.size >= KEPT_BOUNDS_LIMIT) byBounds.clear()
        kept = { byOwn: new WeakMap() }
        byBounds.set(key, kept)
    }
    if (validate == null) return kept.withoutOwn || (kept.withoutOwn = bounded)
    const reused = kept.byOwn.get(validate)
    if (reused) return reused
    kept.byOwn.set(validate, bounded)
    return bounded
}

/**
 * UI RENDERER COMPONENTS SETUP ================================================
 * Map Component props and Methods for recursive rendering
 * =============================================================================
 */

Render.Tooltip = Tooltip

/**
 * Map UI Render props to final Rendering Component/s
 *
 * @param {String} view - component type (one of FIELD.TYPE values)
 * @param {Array} items - nested child component props
 * @param {Object|Array} data - global data object to be passed down to child components
 * @param {*} _data - local data object to be consumed by the component for rendering
 * @param {Boolean} debug - whether to use debug mode
 * @param {Class} instance - UI Render instance
 * @param {Boolean} relativeData - whether to retrieve values from local `_data`, defaults to global `data`
 * @param {Number|String} relativeIndex - used when component is rendered in array
 * @param {String} relativePath - path used to compute form input "name" attribute
 * @param {Object} form - react-final-form FormApi instance
 * @param {String|Object} [showIf] - whether to not render the component if it evaluates to truthy value
 * @param {Function} [Render] - the recursive renderer
 * @param {String} [version] - of the config
 * @param {*} [props] - other component props
 * @returns {JSX.Element|*} React component
 */
const RenderComponent = ({
    view, items, data, _data, debug, form, instance,
    showIf, relativeData, relativeIndex, relativePath, version,
    // Superseded by the INSTANCE's translator below, and `translate` is a real HTML global attribute:
    // left in `props` it reaches the DOM via spread (e.g. TableCell -> <td>) and React warns on the function value.
    translate: _translate,
    // Engine-internal: `Render.tsx` hands this to every node so value renderers can pick a currency symbol,
    // but most views never read it, and left in `props` it reached the DOM as currencycode="USD" on div/span/
    // td/th/tr/input (331 occurrences across 33 of the 38 examples). Stripping it here rather than in each
    // presentational component is safe because the propagation *down the tree* is done independently by
    // `Render.tsx`; only the leaf spread is cut. The two views that genuinely consume it -- `List`, which
    // injects it into every rendered item, and the Tabs branch, which injects it into tab/content
    // definitions -- receive it explicitly below.
    currencyCode,
    ...props
}: MetaAttributes) => {
    // Subscribed, as it always was, so a node renders again when the popup opens or closes. It read a
    // `popup` key off the context until the checker found the context has none: see `Table.group` below.
    useContext(AppContext)
    // The column labels of the table body this node sits in, if any: see `TableColumnsContext`.
    const columns = useContext(TableColumnsContext)
    // The instance's own translator, not the module global: `Active.translate` is owned by whichever
    // UIRender was constructed LAST, so reading it here made a re-rendering instance translate with a
    // sibling's function. The fallback covers nodes rendered without an instance (tests, and the
    // components that read `Active.translate` as a prop default).
    const translate = (instance && instance.translate) || Active.translate
    /* General showIf logic — the whole decision lives in `showIf.ts`, testable on its own. */
    const shown = shouldRender({ showIf, data, _data, relativeData, relativePath, relativeIndex, instance })
    // The fields that mount below this node, or that go when it hides, register and unregister as one burst, which
    // the form tells every field of once (`registrationsOf`, `modules/form/batchedForm.ts`). The bracket opens in a
    // layout effect, before any field below registers in the passive effects, and closes in a passive effect, after
    // they all have (`useBracket`). When a tab, a step or a page changes, the new content's nodes bracket the old
    // content's fields going as well: those go in the same commit's passive effects, which come between.
    useBracket(registrationsOf(form), shown)
    if (!shown) return null

    switch (view) {
        case FIELD.TYPE.DATA:
            return <Data
                instance={instance}
                // @Note: falls back to root data for every falsy `_data`, not just `undefined`.
                // A nested render needs an object to bind against, so passing `null`/`0`/`''`/`false`
                // through makes the whole block (and its fields) disappear instead of rendering.
                data={_data || data}
                {...props}
                relativeIndex={relativeIndex}
                relativePath={relativePath}
            />

        case FIELD.TYPE.COL:
        case FIELD.TYPE.COL2:
        case FIELD.TYPE.COL3: {
            return <View {...props}>{items.map(Render)}</View>
        }

        case FIELD.TYPE.ROW:
        case FIELD.TYPE.ROW2: {
            return <Row {...props}>{items.map(Render)}</Row>
        }

        case FIELD.TYPE.LIST:
        case FIELD.TYPE.COL_LIST:
        case FIELD.TYPE.COL_LIST3: {
            return <List items={_data} {...props} currencyCode={currencyCode}/>
        }

        case FIELD.TYPE.ROW_LIST:
        case FIELD.TYPE.ROW_LIST2: {
            return <List items={_data} {...props} currencyCode={currencyCode} row/>
        }

        case FIELD.TYPE.TABLE_CELLS: {
            const { onDataChanged: _1, ...rest } = props
            // Each cell `item` must receive the parent row's relativePath/relativeIndex so Input names
            // become e.g. `path[0].field`, not `path.field` (final-form throws on the latter when `path` is an array).
            // metaToProps usually stamps these on each cell, but merge from `rest` when missing.
            return <>{items.map((item: any, i: number) => {
                const merged = {
                    ...item,
                    // A field in the cell that names nothing is named by its column's header, when the row has a cell
                    // per header: until 2026-10-09 it had no name, and most nameless controls in the examples were these.
                    ...(columns && columns.length === items.length && columns[i] && isUnnamedField(item) && {
                        'aria-label': columns[i],
                    }),
                    ...(item.relativePath == null && relativePath != null && { relativePath }),
                    ...(item.relativeIndex == null && relativeIndex != null && { relativeIndex }),
                }
                return (
                    <Table.Cell key={i} {...rest}>
                        {Render(merged, i)}
                    </Table.Cell>
                )
            })}</>
        }

        case FIELD.TYPE.AUTO_SUBMIT: {
            return <AutoSave {...props}/>
        }

        case FIELD.TYPE.CHECKBOX: {
            return <Checkbox {...props} translate={translate}/>
        }

        case FIELD.TYPE.EXPAND: {
            if (props.label != null && props.title == null) {
                props.title = props.label
                delete props.label
            }
            if (props.name != null && props.title == null) props.title = props.name
            if (items.length) props.children = () => items.map(Render)
            return <Expand {...props} bracket={registrationsOf(form)}/>
        }

        case FIELD.TYPE.EXPAND_LIST: {
            return <ExpandList items={_data} {...props} bracket={registrationsOf(form)}/>
        }

        case FIELD.TYPE.BUTTON: {
            if (items.length) props.children = items.map(Render)
            if (props.label != null && props.children == null) {
                props.children = props.label
                delete props.label
            }
            return <Button {...props} translate={translate}/>
        }

        case FIELD.TYPE.COUNTER: {
            return <Counter {...props}/>
        }

        case FIELD.TYPE.ICON: {
            if (items.length) props.children = items.map(Render)
            return <Icon {...props}/>
        }

        case FIELD.TYPE.IMAGE: {
            if (items.length) props.children = items.map(Render)
            return <Image {...props}/>
        }

        case FIELD.TYPE.LABEL: {
            if (items.length) props.children = items.map(Render)
            return <Label {...props} translate={translate}/>
        }

        case FIELD.TYPE.PIE_CHART: {
            const { mapItems, ...prop } = props
            if (mapItems) _data = mapProps(_data, mapItems, { debug })
            if (items.length) prop.children = items.map(Render)
            return <PieChart items={_data} {...prop} translate={translate}/>
        }

        case FIELD.TYPE.PROGRESS_STEPS: {
            const steps = items.map(({ step, label, content, data, _data, ...info }: any, i: number) => {
                return {
                    ...info,
                    step: isObject(step) ? Render.call(this, { data, _data, debug, form, instance, ...step }, i) : step,
                    label: isObject(label) ? Render.call(this, {
                        data,
                        _data,
                        debug,
                        form,
                        instance, ...label
                    }, i) : label,
                    content: isObject(content) ? Render.bind(this, {
                        data,
                        _data,
                        debug,
                        form,
                        instance, ...content
                    }, i) : content
                }
            })
            return <ProgressSteps items={steps} {...props}/>
        }

        case FIELD.TYPE.SPACE: {
            return <Space {...props}/>
        }

        case FIELD.TYPE.TABLE: {
            const { extraItems, filterItems, parentItem, group, ...table } = props
            const additionalCellsStyles: React.CSSProperties[] = []
            if (!isList(_data)) _data = []

            // Matrix table headers and data transform
            if (group) {
                // `header` must exist as a single object, otherwise there is no way to group tables
                let {
                    by: { id, label, renderLabel, ...groupByProps } = {},
                    header,
                    extraHeader = { label: '' }
                } = group
                const errorTitle = `Incorrect config for ${view} with {name: "${props.name}"}!`
                // A misconfiguration is THROWN, and the node's error boundary renders it. These three
                // used to open a popup through `popup.setPopupState`, read off a context key that does
                // not exist, so each threw a TypeError instead (found by the checker): the node failed
                // the same way, with a diagnostic that named the TypeError, not the misconfiguration.
                // The two required ids are reported together, as the two popups reported them.
                const misconfigured = (content: string): never => { throw new Error(`${errorTitle} ${content}`) }
                const missing: string[] = []
                if (id == null) missing.push(`${view}.group.by must have 'id', got '${toJSON(group.by, null, 2)}'`)
                if (!header || header.id == null) missing.push(`${view}.group.header must have 'id', got '${toJSON(header, null, 2)}'`)
                if (missing.length) misconfigured(missing.join(' '))

                // First, check data to determine headers
                const groupsByValue: Record<string, any> = {}
                const rowsByCommonValue: Record<string, any[]> = {}
                for (const row of _data) {
                    const { [id]: groupId, [header.id]: commonValue } = row
                    if (groupId != null) groupsByValue[groupId] = groupId
                    if (commonValue != null) rowsByCommonValue[commonValue] = [...(rowsByCommonValue[commonValue] || []), row]
                }
                const groupIds = Object.values(groupsByValue)
                if (groupIds.length) {

                    // Transform headers
                    const _headers = (props.headers || [])
                    const newHeaders = toFlatList(groupIds.map(_id => _headers.map(({
                        id,
                        ...h
                    }: any) => ({ id: `${id}_${_id}`, ...h }))))
                    table.headers = [header].concat(newHeaders)

                    // Label grouped tables
                    if (label != null && !hasObjectValue(label)) {
                        misconfigured(`${view}.group.by.label must resolve to object of labels by ${id} 'value', got '${toJSON(label, null, 2)}'`)
                    }
                    const groupHeaders = groupIds.map(id => ({
                        colSpan: _headers.length,
                        label: label ? (renderLabel ? renderLabel(label[id]) : label[id]) : id,
                        ...groupByProps,
                    }))
                    const newExtraHeaders = [
                        [extraHeader].concat(groupHeaders)
                    ]
                    table.extraHeaders = (props.extraHeaders || []).concat(newExtraHeaders)

                    // Transform data by grouping them with `commonValue`
                    _data = Object.values(rowsByCommonValue).map(rows => {
                        const item: Record<string, any> = {}
                        rows.forEach(row => {
                            const { [id]: groupId, [header.id]: commonValue, ..._item } = row
                            item[header.id] = commonValue
                            for (const key in _item) {
                                item[`${key}_${groupId}`] = _item[key]
                            }
                        })
                        return item
                    })
                }
            }

            // Mixed array nested table data filtering
            if (filterItems && parentItem) {
                _data = _data.filter((item: any) => {
                    return !filterItems.find((filter: any) => {
                        for (const key in filter) {
                            // If mismatch in value found, filter out given item
                            if (get(item, key) !== get(parentItem, filter[key])) return true
                        }
                        return false
                    })
                })
            }

            // Table with custom rows
            if (extraItems) _data = _data.concat(extraItems.map((sourceItem: any) => {
                const item = { ...sourceItem }
                for (const id in item) {
                    const definition = item[id]
                    if (isObject(definition)) {
                        if ((definition.name && Object.keys(definition).length === 1)) {
                            item[id] = get(data, definition.name)
                        } else if (definition.name && definition.render) {
                            item[id] = { ...definition, data: get(data, definition.name) }
                        } else if (definition.view) {
                            item[id] = (_: unknown, index: unknown, props: any) => Render({ debug, ...props, ...definition })
                        }
                    }
                }
                return item
            }))

            if (table.colGroup) {
                let accumulatedWidth = 0
                table.colGroup.forEach((col: any) => {
                    if (col.isFixed && col.style) {
                        additionalCellsStyles.push({
                            left: `${accumulatedWidth}px`,
                            position: 'sticky',
                            zIndex: 1,
                        })
                        accumulatedWidth += parseInt(col.style.minWidth) || 0
                    }
                })
            }

            // FieldArray must register the same dot-path as row Inputs (relativePathFrom), not the short `name`
            // (e.g. `dataKind.lineItems`). Otherwise subscriptions drift and values can clear on blur while form.values
            // still holds data under the full path.
            let fieldArrayName = table.name
            if (table.name != null) {
                fieldArrayName = relativePathFrom(
                    { name: table.name, relativeData: table.relativeData !== false },
                    relativePath,
                    relativeIndex
                )
            }

            return <TableView
                items={_data}
                additionalCellsStyles={additionalCellsStyles}
                fieldArrayName={fieldArrayName}
                {...table}
                translate={translate}
                bracket={registrationsOf(form)}
            />
        }

        case FIELD.TYPE.TABS:
        case FIELD.TYPE.TAB_LIST: {
            const { childrenBeforeTabs, childrenAfterTabs } = props
            if (hasObjectValue(childrenBeforeTabs))
                props.childrenBeforeTabs = Render.bind(this, {
                    data,
                    _data,
                    debug,
                    form,
                    instance, ...childrenBeforeTabs
                })
            if (hasObjectValue(childrenAfterTabs))
                props.childrenAfterTabs = Render.bind(this, {
                    data,
                    _data,
                    debug,
                    form,
                    instance, ...childrenAfterTabs
                })

            switch (view) {
                case FIELD.TYPE.TAB_LIST:
                    return <TabList items={_data} {...props}/>

                case FIELD.TYPE.TABS:
                default:
                    return <Tabs items={items.map(({ tab, content, _data, data }: any, i: number) => ({
                        tab: isObject(tab) ? Render.call(this, {
                            data,
                            _data,
                            debug,
                            form,
                            instance,
                            currencyCode, ...tab
                        }, i) : tab,
                        content: isObject(content) ? Render.bind(this, {
                            data, _data, debug, form, instance, currencyCode, ...content
                        }, i) : content,
                    }))} {...props}/>
            }
        }

        case FIELD.TYPE.TEXT:
        case FIELD.TYPE.TITLE: {
            if (props.label != null && props.children == null) {
                props.children = props.label
                delete props.label
            }
            if (items.length) {
                props.children = items.map(Render)
                delete props.renderLabel
            } else if (props.renderLabel) {
                props.children = props.renderLabel(props.children)
                delete props.renderLabel
            } else if (props.name) {
                // With `relativeData: false` Render.tsx did not resolve the data by `name`. Popup content renders
                // its items that way, against one row: in `_data` when the popup resolved it, else in `data`,
                // which is the row for a popup declared inside a nested row document. Rendered as the text,
                // that context was a crash for an object (React rejects objects as children) and nothing for
                // none. The field the item names is in it; a primitive context is left as it was.
                props.children = relativeData === false && (_data == null || isObject(_data))
                    ? get(_data == null ? data : _data, props.name)
                    : _data
            }
            if (view === FIELD.TYPE.TITLE) props.className = cn('h3', props.className)
            return <Text {...props} translate={translate}/>
        }

        case FIELD.TYPE.TOOLTIP: {
            if (props.label != null && props.content == null) {
                props.content = props.label
                delete props.label
            }
            if (props.renderLabel) {
                props.content = props.renderLabel(props.content)
                delete props.renderLabel
            }
            if (items.length) {
                props.children = items.map(Render)
            } else if (isObject(props.children)) {
                props.children = Render({ debug, ...props.children })
            }
            return <Tooltip inverted {...props}/>
        }

        case FIELD.TYPE.POPUP: {
            if (!instance.popupById) instance.popupById = {}
            const { id, ...popup } = props

            /**
             * Popup is a special case, it does not render content to the DOM immediately, only as VirtualDOM.
             * When user clicks on a button that opens popup, the VirtualDOM is inserted to Popup component for rendering.
             * @withForm needs to wrap the entire content to provide Form field instance using existing form.
             */
            const PopupContent = memo(function PopupContent () {
                return items.map(Render)
            })

            // Store popup with template ID if it contains variables
            // The ID will be interpolated when popup is opened
            if (id && id.includes('{')) {
                // Store template with items and context for later content creation
                if (!instance.popupTemplates) instance.popupTemplates = {}
                instance.popupTemplates[id] = { 
                    ...popup, 
                    // Store items and context to create new content when popup opens
                    items,
                    data,
                    _data,
                    form,
                    instance,
                    relativeIndex,
                    relativePath,
                    relativeData
                }
            } else {
                // Static ID - store directly with content
                instance.popupById[id] = { ...popup, content: <PopupContent/> }
            }
            return null
        }

        default: {
            if (items.length) props.children = items.map(Render)
            const { mapOptions, removable, autoSubmit, expanded: _1, ...input } = props
            const { readonly, disabled } = data || {}
            if (mapOptions) input.options = keptMappedOptions(input.options, mapOptions, debug)

            // Resolve Input name dynamic path
            // relativePath should be used to form input name even when relativeData === false (e.g., in popups)
            // relativeData === false only prevents automatic data extraction, but doesn't affect name generation
            if (relativePath != null && input.name) {
                const uniqueIdentificator = `${relativePath}${relativeIndex != null ? `[${relativeIndex}]` : ''}.${input.name}`
                input.id = uniqueIdentificator
                input.name = uniqueIdentificator
            }

            // Render Dropdown separately, to avoid triggering form value changes
            if (view === FIELD.TYPE.DROPDOWN) {
                // proxy onChange to prevent event sent as second argument
                const { onChange, ...dropdown } = input
                return <Dropdown
                    lazyLoad={false}
                    onChange={onChange ? (value => onChange(value)) : undefined}
                    {...dropdown}
                    translate={translate}
                />
            }

            // Form value changing fields should have 'Input' as view
            if (view === FIELD.TYPE.INPUT) {
                switch (input.type) {
                    case 'select':
                        view = FIELD.TYPE.SELECT
                        break
                    case 'slider':
                        view = FIELD.TYPE.SLIDER
                        break
                    case 'toggle':
                        view = FIELD.TYPE.TOGGLE
                        break
                    case 'file':
                        view = FIELD.TYPE.UPLOAD
                        input.className = cn('input--wrapper', input.className)
                        break
                }
                if (input.icon && input.icon.view) input.icon = Render({ debug, ...input.icon })
            }

            // For stable-value Selects, convert value to index for setState (supports {state.xxx} in cascading)
            // Only pass the converted value (not name/event) so setStates uses the config keyPath,
            // not the modified input.name which includes relativePath prefix
            if (view === FIELD.TYPE.SELECT && isObject(mapOptions) && mapOptions.value && mapOptions.value !== '{index}' && input.onChange) {
                const stableOnChange = input.onChange
                const mappedOptions = input.options || []
                // Kept like the handlers `autoSubmit` and `removable` add: the options it searches are the kept ones above.
                input.onChange = keptHandler(instance, handlerSlot('selectIndex', input.name), [stableOnChange, mappedOptions], () => (value: unknown) => {
                    const idx = mappedOptions.findIndex((o: any) => String(o.value) === String(value))
                    return stableOnChange(idx >= 0 ? String(idx) : value)
                })
            }

            // Auto submit on changes
            if (autoSubmit) {
                const { onChange } = input
                const submit = autoSubmitter(instance, autoSubmit.delay >= 0 ? autoSubmit.delay : TIME_DURATION_INSTANT)
                input.onChange = keptHandler(instance, handlerSlot('autoSubmit', input.name), [onChange, submit], () => (value: unknown) => {
                    onChange && onChange(value)
                    submit()
                })
            }

            // Input clearing
            if (removable) {
                // The name and the `onChange` it calls are read here, not when the icon is clicked: nothing
                // below changes either, so they are what this render's `input` holds when it is clicked.
                const { onRemove, onClickIcon, onChange, name } = input
                const submits = Boolean(autoSubmit)
                input.icon = 'delete'
                input.classNameIcon = 'button circle small transparent appear-on-hover'
                input.onClickIcon = keptHandler(instance, handlerSlot('removable', name), [form, name, onRemove, submits, onChange, onClickIcon], () => (...args: unknown[]) => {
                    // todo: for some reason Dropdown/Select have `form` undefined
                    form && form.change && form.change(name, null)
                    onRemove && onRemove(name)
                    submits && onChange(null)
                    onClickIcon && onClickIcon(...args)
                })
            }

            // Validate type="number" with min/max
            if (input.type === 'number') {
                const { validate, min, max } = input
                if (min != null || max != null) input.validate = boundedValidator(instance, validate, min, max)
            }

            return renderField({ view, ...input, instance, ...readonly && { readonly }, ...disabled && { disabled }, translate })
        }
    }
}

/**
 * Render Value Function Getter
 *
 * @param {String} Name - one of FIELD.TYPE definitions
 * @returns {Function} renderer - that takes value as the first argument, and renders value in desired format
 */
Render.Method = function RenderMethod (Name: string) {
    switch (Name) {
        case FIELD.RENDER.CURRENCY:
            return (val: any, index?: unknown, { id, decimals = 2, symbol = '$', className, style, ...props }: RenderMethodOptions = {}) => {
                return (isNumeric(val)
                        ? <Row className={className} style={style}>
                            <Text className="margin-right-smallest">{symbol}</Text>
                            {renderFloat(val, decimals, props)}
                        </Row>
                        : null
                )
            }
        case FIELD.RENDER.DOUBLE5:
            return (val: any, index?: unknown, { id, decimals, ...props }: RenderMethodOptions = {}) => isNumeric(val) ? renderFloat(val, 5, props) : null
        case FIELD.RENDER.FLOAT:
            return (val: any, index?: unknown, {
                id,
                decimals,
                ...props
            }: RenderMethodOptions = {}) => isNumeric(val) ? renderFloat(val, decimals, props) : null
        case FIELD.RENDER.PERCENT:
            return (val: unknown, index?: unknown, { id, decimals, className, style, ...props }: RenderMethodOptions = {}) => (isNumeric(val)
                    ? <Row className={className} style={style}>
                        {renderFloat(Number(val) * 100, decimals, props)}
                        <Text className="margin-left-smallest">%</Text>
                    </Row>
                    : null
            )
        case FIELD.RENDER.TITLE_n_INPUT:
            return (val: React.ReactNode, index?: unknown, { id, ...props }: RenderMethodOptions = {}) => <Row {...props}><Text>{val}</Text></Row>
        case FIELD.RENDER.STRING:
            return (val: React.ReactNode) => {
                return <Text>{val}</Text>
            }
        case FIELD.RENDER.DATE: {
            return (val: unknown) => {
                if (val) {
                    return <TextDateValue value={val}/>
                }
                return null
            }
        }
        default:
            return (val: React.ReactNode) => <Text>{val}</Text>
    }
}

/**
 * The library's own sink for a per-node render failure (UPGRADE-PLAN §9.4, §2.6-3).
 *
 * @Note: this used to destructure `{err, errInfo}` while the boundary emits
 * `{error, errorInfo}`, so it printed `undefined undefined` and a render failure was, in
 * practice, silent. It also used `console.log`, which is not where a failure belongs.
 *
 * The whole report is logged after the formatted line so a developer can open `errorInfo`
 * (React's component stack) and `props` (the node's resolved props) in the console. A host
 * that wants to *handle* the failure — report it, show its own message — passes the
 * documented `onError` prop instead of replacing this function; both run.
 *
 * @param {Object} report - {error, errorInfo, props, path, message}
 * @returns {void}
 */
Render.onError = (report: RenderErrorReport) => console.error(formatRenderError(report), report)

Render.Component = RenderComponent
