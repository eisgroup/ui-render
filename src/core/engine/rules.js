import React, { Component, Fragment, PureComponent, isValidElement } from 'react'
import '../modules/form/constants'
import { withForm } from '../modules/form'
import { FIELD } from '../modules/variables'
import { cn, type } from '../components'
import Json from '../components/JsonView'
import ScrollView from '../components/ScrollView'
import { Active, get, interpolateString, isEmpty, isList, isString, round, sanitizeResponse } from '../utils'
// `set` mutates and `setIn` copies: `set` is for objects this file has just built (the local
// `update` below), `setIn` for anything React has already been handed, i.e. `this.state`.
// Every `setIn` on state goes through the UPDATER form: an immutable copy built from `this.state`
// would be built from the state as it was before any other update in the same batch, so two
// writes into one container would undo each other. The mutating version had no such problem,
// which is why this is not a detail of the rewrite but the point of it.
import { cloneDeep, hasObjectValue, isObject, set, setIn } from '../utils/object'
import Render, { metaToProps } from './index'
import './mapper' // Set up UI Renderer components and methods
import { cancelAutoSubmit } from './autoSubmit'
import { download } from './download'
import { upload } from './upload'
import { applyPeriods } from './applyPeriods'
import { parsePopupArgs } from './popupArgs'
import { findPopupTemplate } from './popupTemplate'
import { resolvePopupRowContext, resolvePopupScope } from './popupScope'
import { errorsFor, formsStorage, touchedFor } from '../state/formRegistry'
import { _ } from './translations'
import {
    replaceDeepCopy,
    getFormsData,
    getLiveMergedDataKindArray,
    getRawFormsData,
    mapErrorObjectToUIFormat,
    getDateStringFromDateObject,
    errorsProcessing,
    normalizeIncomingData
} from './utils'
import { isEqual } from '../utils/object'
import { double5, integer, phone, uppercase } from '../components/inputs/normalizers'
import { AppContext } from '../contexts'
import { ConfigOverride } from '../providers'
import Popup from './components/Popup'
import { dataKindPathFor, getDataKindPathFromRelative, pushDataKindRow, removeDataKindRow, rowObjectForDataKindAppend, compactDataKindArrays, dataKindRowHasContent, validateNotWithinRangeDraftRow } from './dataKindPush'

export { getDataKindPathFromRelative, pushDataKindRow, rowObjectForDataKindAppend, compactDataKindArrays, dataKindRowHasContent, validateNotWithinRangeDraftRow }

FIELD.ACTION = {
    ADD_DATA: 'addData',
    DOWNLOAD: 'download',
    UPLOAD: 'upload',
    REMOVE_DATA: 'removeData',
    POPUP_OPEN: 'popupOpen',
    SUBMIT: 'submit',
    UPDATE_DATA_ON_CHANGE: 'updateDataOnChange',
    ON_APPLY_PERIODS: 'onApplyPeriods',
}
FIELD.CROSS_VALIDATE = {
    NOT_WITHIN_RANGE: 'notWithinRange',
}

/**
 * Parse `dataKind.experiencePeriods[0].startDate`-style field names for stable row index (see notWithinRangeValidator).
 */
export function parseArrayPrefixAndRowIndexFromFieldName (fieldName) {
    if (!fieldName || typeof fieldName !== 'string') return null
    const m = fieldName.match(/^(.*)\[(\d+)\]\.[^.[]+$/)
    if (!m) return null
    return { arrayPrefix: m[1], rowIndex: Number(m[2]) }
}

/**
 * Cross-row period overlap validation. Uses final-form (allValues, meta.name) + per-field `instance` closure
 * so row index stays correct after FieldArray.remove (global FIELD.VALIDATION reassignment from `config` was not safe).
 */
function notWithinRangeValidator (value, { dataKind, args: argsIn } = {}, allValues, meta, instance) {
    const args = argsIn || []
    const [start, end] = args
    if (!start || !end || !dataKind) return undefined

    const fromName = meta && meta.name ? parseArrayPrefixAndRowIndexFromFieldName(meta.name) : null
    let rowIndexNum = fromName != null && !Number.isNaN(fromName.rowIndex) ? fromName.rowIndex : null

    let relativePath = null
    if (instance && instance.props) {
        const propsMeta = instance.props.meta
        relativePath = (propsMeta && propsMeta.relativePath) || instance.props.relativePath
        const ri = (propsMeta && propsMeta.relativeIndex != null) ? propsMeta.relativeIndex : instance.props.relativeIndex
        if (rowIndexNum == null && ri != null && ri !== '' && !Number.isNaN(Number(ri))) {
            rowIndexNum = Number(ri)
        }
    }

    const valuesRoot = allValues || (instance && instance.formValues)
    let _a
    let _b
    const arrayPrefix = fromName ? fromName.arrayPrefix : relativePath

    if (arrayPrefix && rowIndexNum != null && valuesRoot) {
        _a = get(valuesRoot, `${arrayPrefix}[${rowIndexNum}].${start}`)
        if (_a === undefined) _a = get(valuesRoot, `${arrayPrefix}.${rowIndexNum}.${start}`)
        _b = get(valuesRoot, `${arrayPrefix}[${rowIndexNum}].${end}`)
        if (_b === undefined) _b = get(valuesRoot, `${arrayPrefix}.${rowIndexNum}.${end}`)
    } else if (valuesRoot) {
        _a = valuesRoot[start]
        _b = valuesRoot[end]
    }

    if (_a !== undefined && _b !== undefined) {
        if (_a === _b) {
            return `Start date and end date cannot be the same`
        } else if (_a === value && String(_b) < String(_a)) {
            return `Start date cannot be more than end date`
        } else if (_b === value && String(_b) < String(_a)) {
            return `End date cannot be less than start date`
        }
    }

    const parentUi = (instance && instance.props && instance.props.parent) || instance
    if (!parentUi || typeof parentUi.getDataKind !== 'function') return undefined

    const form = instance && instance.props && instance.props.form
    const validationScope = form && form.kind === dataKind ? instance.dataKindPath : undefined
    const valuesBy = parentUi.getDataKind(dataKind, validationScope)
    const ranges = []
    const thisIndex = form && form.kind === dataKind && rowIndexNum != null && !Number.isNaN(rowIndexNum)
        ? String(rowIndexNum)
        : null
    if (isList(valuesBy)) {
        for (let i = 0; i < valuesBy.length; i++) {
            if (thisIndex != null && String(i) === thisIndex) continue
            const row = valuesBy[i]
            if (row == null || typeof row !== 'object') continue
            const a = row[start]
            const b = row[end]
            if (a == null || b == null || a === '' || b === '') continue
            ranges.push([a, b])
        }
    }

    if (_a && _b) {
        let s1 = String(_a); let e1 = String(_b)
        let curLo = s1 <= e1 ? s1 : e1
        let curHi = s1 <= e1 ? e1 : s1
        if (value != null && value !== '') {
            const v = String(value)
            if (v < curLo) curLo = v
            else if (v > curHi) curHi = v
        }
        const overlapsPeer = ranges.some(([a, b]) => {
            const sa = String(a); const sb = String(b)
            const pLo = sa <= sb ? sa : sb
            const pHi = sa <= sb ? sb : sa
            return !(curHi < pLo || pHi < curLo)
        })
        if (overlapsPeer) {
            return `Periods cannot overlap`
        }
    }

    return undefined
}

FIELD.VALIDATION[FIELD.CROSS_VALIDATE.NOT_WITHIN_RANGE] = notWithinRangeValidator

FIELD.NORMALIZE = {
    DATE: 'date',
    HOUR_MINUTE: 'hh:mm',
    DOUBLE5: 'double5',
    INTEGER: 'integer',
    PHONE: 'phone',
    UPPERCASE: 'uppercase',
    CURRENCY: 'currency',
    PERCENT: 'percent',
}

FIELD.NORMALIZER = {
    [FIELD.NORMALIZE.DOUBLE5]: double5,
    [FIELD.NORMALIZE.INTEGER]: integer,
    [FIELD.NORMALIZE.PHONE]: phone,
    [FIELD.NORMALIZE.UPPERCASE]: uppercase,
    [FIELD.NORMALIZE.DATE]: (val) => {
        if (val) {
            const date = new Date(val)
            return getDateStringFromDateObject(date)
        }
    },
    [FIELD.NORMALIZE.CURRENCY]: (v) => v == null ? v : Number((v || 0) || 0).toFixed(2),
    [FIELD.NORMALIZE.PERCENT]: (v) => {
        return v == null ? v : (Number((v || 0) || 0) * 100).toLocaleString()
    },
}
FIELD.PARSER = {
    ...FIELD.PARSER,
    [FIELD.NORMALIZE.PERCENT]: function fromPercent (v) {
        return v && round(v / 100, 5)
    },
}

// `formsStorage` and `errorsMap` used to be DECLARED here, which is what made `modules/form` reach
// back into the engine for them (§2.6-4). They now live in `state/formRegistry`, a layer both sides
// may import, and are re-exported from here so every existing import of them keeps working — the
// move is meant to dissolve the cycle, not to churn twenty call sites. §9.3 step 3 makes them
// per-instance, and that will be a change inside `formRegistry` rather than a search.
export { formsStorage }


/**
 * UI Render Instance Component
 * @example:
 *    <UIRender data={data} meta={meta} initialValues={data} onSubmit={this.submit}/>
 */
export class UIRender extends Component {
    static propTypes = {
        data: type.Any.isRequired,
        meta: type.Object.isRequired,
        initialValues: type.Any, // should be the same as `data` initially
        childBefore: type.Any,
        childAfter: type.Any,
        // If given, will render <form onSubmit {...form} />
        form: type.OneOf(type.Boolean, type.Of({
            kind: type.Id,
        })),
        // Whether to disable rendering of wrapper scroll view and html form
        embedded: type.Boolean,
        getFormData: type.Method,
        onDataChanged: type.Method,
        getValidationErrors: type.Method,
        methods: type.ObjectOf(type.Method),
        translate: type.Method,
        apiCalls: type.ObjectOf(type.Method),
        // Configuration published to every rendered component through ConfigContext
        // (UPGRADE-PLAN §9.4). `dateFormat` takes moment format tokens and applies to every
        // rendered and edited date; `currency` and `language` are the two values the
        // application shell turns into CSS classes. @Note: `currency` is NOT
        // `meta.currencyCode`, which selects the currency symbol used by value renderers.
        dateFormat: type.String,
        currency: type.String,
        language: type.String,
        // Called with a report whenever a node's subtree fails to render (§9.4).
        onError: type.Method,
    }

    constructor (props) {
        super(props)
        // The instance's OWN error callback. It used to be a module-level `let`, so the LAST instance
        // constructed owned it for everybody: measured on two documents, the first one's validation
        // error was delivered to the SECOND one's callback and the first one's callback was never
        // called at all. Nothing else read that global, so it is gone rather than shadowed.
        // An instance reports only if it was given a callback; it does not inherit its owner's,
        // because the error map is still shared and the owner already reports those errors itself.
        if (typeof props.getValidationErrors === 'function') {
            this.errorHandler = props.getValidationErrors
        }
        // The instance's OWN translator, built once so its identity is stable across renders.
        // `Active.translate` is still assigned because seven components read it as a prop default and
        // `modules/upload` reads it directly, but it must not be what the engine renders with: it is
        // module-level, so the LAST instance constructed owns it, and a first instance that re-renders
        // afterwards translates with the second one's function for the rest of its life. Measured, not
        // assumed — see `rules.two-instances.test.js`, which fails on the previous code.
        if (typeof props.translate === 'function') {
            const translate = props.translate
            this.translate = value => typeof value === 'string' ? translate(value) : value
            Active.translate = this.translate
        } else if (props.parent && typeof props.parent.translate === 'function') {
            // An embedded instance is not given the prop; it inherits the one its owner was built with
            // rather than falling through to whatever the module global happens to hold.
            this.translate = props.parent.translate
        }

        this.state = {
            data: {
                json: normalizeIncomingData(this.props.data)
            },
            meta: {
                json: this.props.meta
            },
            errors: {},
            key: new Date(),
            isPopupOpen: false,
            popupTitle: '',
            popupContent: '',
            currencyCode: (this.props.meta && this.props.meta.currencyCode) || 'USD',
        }
    }

    UNSAFE_componentWillReceiveProps (next, nextContext) {
        const update = {}
        const { data, meta } = this.props

        if (next.data !== data) set(update, 'data.json', normalizeIncomingData(next.data))
        if (next.meta !== meta) set(update, 'meta.json', next.meta)
        if (next.meta && next.meta.currencyCode && next.meta.currencyCode !== this.state.currencyCode) {
            update.currencyCode = next.meta.currencyCode
        }
        if (hasObjectValue(update)) this.setState(update)
    }

    componentDidMount () {
        if (typeof this.props.getFormData === 'function') {
            this.props.getFormData(this.getAllFormsData)
        }

        if (typeof this.props.onDataChanged === 'function') {
            this.onDataChanged = this.props.onDataChanged
        } else if (this.props.parent && typeof this.props.parent.onDataChanged === 'function') {
            this.onDataChanged = this.props.parent.onDataChanged
        }
    }

    componentDidUpdate () {
        if (this.props.meta) {
            errorsProcessing(this.form, this.props.meta)
        }

        // This instance's errors. Until §9.3 step 3 split the map, every instance compared against
        // the same one, so a second document repeated the first one's errors to its own callback.
        const ownErrors = this.form ? errorsFor(this.form) : {}
        if (typeof this.errorHandler === 'function'
            && !isEqual(ownErrors, this.state.errors)
        ) {
            const errors = cloneDeep(ownErrors)
            this.errorHandler(mapErrorObjectToUIFormat(errors))
            this.setState({ errors })
        }
    }

    getAllFormsData = () => {
        // TODO: investigate realisation with this.data
        // this.data contains related data but there no all changes
        // Strip the renderExtraItem draft slot (empty `{}` at array.length) from `dataKind.*` arrays
        // before returning — same compaction used after REMOVE_DATA.
        return compactDataKindArrays(getFormsData(formsStorage))
    }

    // Raw form values without Select array reordering — for showIf lookups
    getRawFormsData = () => {
        return getRawFormsData(formsStorage)
    }

    getCalledMethod = () => {
        const { methods = {} } = this.props
        return methods
    }

    getAPICalls = () => {
        const { apiCalls = {} } = this.props
        return apiCalls
    }

    onDataChanged = undefined

    render () {
        const {
            childBefore, childAfter, form, embedded, className, style, parent,
            dateFormat, currency, language,
        } = this.props
        const { key } = this.state

        const content = this.hasData && this.hasMeta &&
            <Render
                key={key}
                data={this.data}
                {...this.meta}
                form={this.form || parent.form}
                // Must be this UIRender instance so Inputs use this.form (via withFormSetup getter).
                // Passing parent here made embedded Data / renderExtraItem fields call instance.form.change
                // on the root form while Field names targeted nested paths — values leaked into the parent object.
                instance={this}
                translate={this.translate || Active.translate}
                onDataChanged={this.onDataChanged}
                currencyCode={this.state.currencyCode}
            />
        const Container = embedded ? Fragment : ScrollView
        const props = embedded ? undefined : {
            fill: true,
            className: cn('ui__render fade-in bg-neutral', className),
            style,
        }

        const tree = parent
            ? <Container {...props}>
                {childBefore}
                {(form && !embedded) ? <form onSubmit={this.handleSubmit} {...form}>{content}</form> : content}
                {childAfter}
            </Container>
            : <Container {...props}>
                {childBefore}
                {(form && !embedded) ? (content ||
                    <form onSubmit={this.handleSubmit} {...form}>{content}</form>) : content}
                {childAfter}
                <Popup />
            </Container>

        // The configuration props are published here, around the whole subtree, rather than
        // threaded down as props: components read them from `ConfigContext`, and a prop on
        // every node would be spread onto components and leak into the DOM. Wrapping the
        // engine (not only the library entry point) is what makes the props work for a host
        // that mounts this component directly — the demo does, and so do the harnesses.
        return (
            <ConfigOverride dateFormat={dateFormat} currency={currency} language={language}>
                {tree}
            </ConfigOverride>
        )
    }
}

UIRender.contextType = AppContext

const UIRenderWithUISetup = Decorator(UIRender)
export default UIRenderWithUISetup


/**
 * Transform *_meta.json API response into custom rules applied by the team
 */
export function transformConfig (meta) {
    return toOpenLConfig(sanitizeResponse(meta || {}, { tags: [] }))
}

export function toOpenLConfig (meta) {
    if (isObject(meta)) {
        const { view } = meta

        // Apply default Dropdown config if onChange is not defined
        if ((view === FIELD.TYPE.DROPDOWN || view === FIELD.TYPE.SELECT) && meta.name != null && meta.onChange == null) {
            meta.onChange = FIELD.ACTION.SET_STATE + ',' + meta.name
            // if (meta.value == null) meta.value = {name: `{state.${meta.name},0}`}
            if (meta.options != null) {
                if (isString(meta.options)) meta.options = { name: meta.options }
                if (isObject(meta.mapOptions)) {
                    if (meta.mapOptions.value == null) meta.mapOptions.value = '{index}'
                } else {
                    meta.mapOptions = {
                        text: meta.mapOptions, // if not defined, will default to given option value
                        value: '{index}', // always enforce using index
                    }
                }
            }
        }

        // Add Table Expand to first column if `renderItem` defined, but `renderCell` is undefined
        else if (view === FIELD.TYPE.TABLE && meta.renderItem != null) {
            const firstHeader = get(meta.headers, '[0]')
            if (isObject(firstHeader) && firstHeader.renderCell == null) {
                firstHeader.renderCell = {
                    view: FIELD.TYPE.EXPAND,
                    name: '{value}',
                    index: '{index}',
                    onClick: 'handleItemExpand',
                }
            }
        }
    }

    for (const key in meta) {
        const val = meta[key] // need to also transform Tabs.items collection of objects, which have no `view`
        if (isList(val) || (isObject(val) && (val.view || val.content || val.id))) {
            meta[key] = toOpenLConfig(val)
        }

        // Convert `styles` attribute to `className`
        else if (key === 'styles') {
            meta.className = val
            delete meta[key]
        }
    }

    return meta
}

/**
 * Pre-initialize instance.state from initial data for Select/Dropdown fields.
 * Ensures {state.xxx} interpolation resolves correctly on the first render,
 * before any component mounts.
 *
 * @param {Object} meta - transformed meta (after toOpenLConfig)
 * @param {Object} data - initial data.json
 * @param {Object} instance - UIRender instance (state will be mutated)
 * @param {String} [contextPath] - current data context path from parent containers
 */
export function initSelectStatesFromData (meta, data, instance, contextPath) {
    if (!meta) return
    if (Array.isArray(meta)) {
        for (const item of meta) {
            initSelectStatesFromData(item, data, instance, contextPath)
        }
        return
    }
    if (!isObject(meta)) return

    const { view, name, onChange, mapOptions, options, items, renderItem } = meta
    const isSelectField = view === FIELD.TYPE.SELECT || view === FIELD.TYPE.DROPDOWN

    // For Select/Dropdown with auto-generated setState onChange, seed state from initial data
    if (isSelectField && name && isString(onChange) && onChange.indexOf(FIELD.ACTION.SET_STATE) === 0) {
        if (instance.state[name] == null) {
            const fullPath = contextPath ? `${contextPath}.${name}` : name
            const value = get(data, fullPath)

            if (value != null && value !== '') {
                const mapValue = mapOptions && mapOptions.value
                if (mapValue && mapValue !== '{index}') {
                    // Stable value: find index of matching option in data
                    const optionsName = isObject(options) ? options.name : options
                    if (optionsName) {
                        const optionsPath = contextPath ? `${contextPath}.${optionsName}` : optionsName
                        const optionsList = get(data, optionsPath)
                        if (Array.isArray(optionsList)) {
                            const idx = optionsList.findIndex(o => String(get(o, mapValue)) === String(value))
                            if (idx >= 0) instance.state[name] = String(idx)
                        }
                    }
                } else {
                    // Index-based: value IS the index
                    instance.state[name] = String(value)
                }
            } else if (!mapOptions || !mapOptions.value || mapOptions.value === '{index}') {
                // No value in data for index-based Select — default to first option
                instance.state[name] = '0'
            }
        }
    }

    // Determine child data context path
    let childContext = contextPath
    if (name && !isSelectField) {
        let resolvedName = name
        // Resolve {state.xxx} in container names using already-initialized state
        if (resolvedName.includes('{')) {
            resolvedName = interpolateString(resolvedName, instance, { suppressError: true })
        }
        // Only update context if name was fully resolved (no remaining templates)
        if (!resolvedName.includes('{')) {
            childContext = contextPath ? `${contextPath}.${resolvedName}` : resolvedName
        }
    }

    // Recurse into items
    if (items) initSelectStatesFromData(items, data, instance, childContext)
    if (renderItem) initSelectStatesFromData(renderItem, data, instance, childContext)
}

/**
 * Decorator to extend UI Render instance with nested Data component interface
 */
export function withDataKind (Class) {
    Class.prototype.getDataKindPath = function (relativePath, kind) {
        return getDataKindPathFromRelative(relativePath, kind)
    }

    // Register child instance from parent instance.
    // Registry is scoped by dataKindPath so that children with the same kind+index
    // from different parent rows (2-level nesting) do not overwrite each other.
    // Structure: this.dataKind[kind][scope][index] = instance
    Class.prototype.registerDataKind = function (instance, kind, index) {
        if (!this.dataKind) this.dataKind = {}
        if (!this.dataKind[kind]) this.dataKind[kind] = {}
        const relativePath = instance.props.meta && instance.props.meta.relativePath
        const basePath = this.getDataKindPath(relativePath, kind)
        instance.dataKindPath = basePath
        const scope = basePath || ''
        if (!this.dataKind[kind][scope]) this.dataKind[kind][scope] = {}
        this.dataKind[kind][scope][index] = instance
    }

    // Unregister child instance from parent instance
    Class.prototype.unregisterDataKind = function (instance, kind, index) {
        if (!instance) return
        if (!this.dataKind) return
        // Read scope before clearing it on the instance
        const scope = instance.dataKindPath != null ? instance.dataKindPath : ''
        if (this.dataKind[kind] && this.dataKind[kind][scope]) {
            delete this.dataKind[kind][scope][index]
        }
        delete instance.dataKindPath
    }

    /**
     * Retrieve current forms' values for given data kind.
     * @param {String} kind - Data component kind
     * @param {String} [scope] - dataKindPath scope to limit lookup to a specific parent context
     *   (e.g., for cross-validation within a single parent row in 2-level nesting).
     *   When omitted, derives the path from the first registered scope (backward-compatible).
     * @returns {Array} forms values array, or empty array
     */
    Class.prototype.getDataKind = function (kind, scope) {
        let base
        if (scope != null) {
            base = scope
        } else {
            const byKind = this.dataKind && this.dataKind[kind]
            if (byKind) {
                const firstScope = Object.keys(byKind)[0]
                if (firstScope != null) {
                    base = firstScope
                }
            }
        }
        const pathToDataKindArray = base ? `${base}.dataKind.${kind}` : `dataKind.${kind}`

        const live = getLiveMergedDataKindArray(pathToDataKindArray, formsStorage)
        if (live.length > 0) {
            return live
        }
        const dataJson = getFormsData(formsStorage)
        return get(dataJson, pathToDataKindArray, [])
    }

    return Class
}

/**
 * React Class Decorator to setup UI with necessary variables and function definitions
 * @usage:
 *    - this.data -> *_data.json from state, ready for <Render> component consumption
 *    - this.meta -> transformed *_meta.json data from state, ready for <Render> component consumption
 *    - this.handleSubmit:
 *        1. final-form: to be used like this <form onSubmit={this.handleSubmit}>
 *    - this.hasData and this.hasMeta getters can be used for conditional check
 *    - Initialize with data by overriding initial state
 */

function Decorator (Class) {
    /**
     * THE LIFECYCLE LAYER, AS ITS OWN CLASS (§9.3 step 5).
     *
     * Everything below used to be written onto `UIRenderLifecycle.prototype` — the caller's class, mutated in
     * place at module load. That is what made the engine invisible to anything reasoning about the
     * component tree, and it meant the exported `UIRender` was a different object before and after
     * this module was imported. The layer now lives on a subclass of its own, so the class handed
     * in is left exactly as it was written and the captures below read genuine parent methods.
     *
     * The members below are written as members. Two things deliberately are NOT:
     *
     * `state` stays a prototype assignment because `withFormSetup` MERGES onto it —
     * `Class.prototype.state = {…, ...Class.prototype.state}` — so a class FIELD, which initialises
     * per instance after `super()` returns, would leave that merge reading `undefined` and drop the
     * engine's state shape. Two test harnesses read `prototype.state` directly for the same reason.
     *
     * `config` is still installed by `defineProperty` below: it is four hundred lines of action
     * handlers and moving it is its own change, with its own diff to read.
     */
    class UIRenderLifecycle extends Class {
        get data () {
            return get(this.state, 'data.json')
        }
        set data (value) {
            return this.setState(state => setIn(state, 'data.json', value))
        }

        get meta () {
            if (this._meta != null) return this._meta
            const transformedMeta = transformConfig(cloneDeep(get(this.state, 'meta.json')))
            // Pre-initialize state from data for Select/Dropdown fields,
            // so {state.xxx} interpolation resolves correctly on the first render
            initSelectStatesFromData(transformedMeta, this.data, this)
            return this._meta = metaToProps(transformedMeta, this.config)
        }
        set meta (value) {
            return this._meta = value
        }

        get hasData () {
            return this.data != null
        }

        get hasMeta () {
            return !isEmpty(this.meta)
        }

        // @Note: functions should have consistent pattern of receiving important arguments first,
        // followed by optional arguments.
        // Positional arguments was chosen instead of keyword arguments because
        // it provides more flexibility and separation of concerns between different configs.
        setStates (value, ...rest) {
            /**
             * The state path is the LAST STRING argument, not the second positional one.
             *
             * WHY, because "second positional" looks obviously right and is wrong: a meta's configured
             * action arguments are APPENDED to the caller's by `getFunctionFromString`
             * (`'setState,categoryX'` becomes `(...caller) => setStates(...caller, 'categoryX')`), so
             * the path's position depends on how many arguments the caller passes. A `Button` passes
             * one and the path lands second; a `Dropdown` passes three — `(value, name, event)` — and
             * the path lands FOURTH while the field's own `name` sits second. Reading the second
             * argument therefore wrote to the path named by the field instead of the one the meta
             * asked for, for every `view: 'Select'` whose two differ. `mapper.js` works around it for
             * stable-value Selects by stripping the extra arguments, with a comment saying exactly
             * this; nothing covered the rest.
             *
             * Measured across all four real call shapes, this rule is the only one that is right in
             * all of them — "last argument" is wrong when no path is configured and the caller's last
             * argument is the DOM event, and "second argument" is wrong for any caller passing more
             * than one:
             *   (value, 'categoryX')                      -> 'categoryX'      configured, one-arg caller
             *   (value, name, event, 'categoryX')          -> 'categoryX'      configured, dropdown
             *   (value, name, event)                       -> name            not configured, dropdown
             *   (value)                                    -> undefined       not configured, one-arg
             * The last row keeps today's behaviour deliberately: `set(state, undefined, value)`
             * returns the state unchanged, so the action is a no-op rather than an error, and making
             * it one is a separate decision from fixing the path.
             *
             * Found by the §9.7-F1 step 3 part 1 audit. `transforms.action-args.test.js` pins the
             * composer's half of this and `rules.set-state-path.test.js` this half.
             */
            let keyPath
            for (let i = rest.length - 1; i >= 0; i -= 1) {
                if (typeof rest[i] === 'string') { keyPath = rest[i]; break }
            }
            // Clear cached meta so {state.xxx} templates re-resolve on next render
            // (showIf, container names, option paths all depend on current state)
            this._meta = null
            return this.setState(state => setIn(state, keyPath, value))
        }

        resetForm () {
            this.form.reset()
        }

        popupAlert (title, content) {
            if (isValidElement(content)) {
                this.context.setPopupState({
                    isOpen: true,
                    title: title,
                    content: content
                })
            } else {
                this.context.setPopupState({
                    isOpen: true,
                    title: title,
                    content: <Json data={content}/>
                })
            }

        }

        componentWillUnmount (nextProps, nextState) {
            const { parent, form, index } = this.props
            if (parent && index != null) parent.unregisterDataKind(this, form.kind, index)
            // A change typed just before unmount must not submit a form the user has left.
            cancelAutoSubmit(this)
            if (super.componentWillUnmount) super.componentWillUnmount(...arguments)
        }

        UNSAFE_componentWillMount (nextProps, nextState) {
            // Wrap form.submit with HOC to extract nested form values before submission
            this.submit = (...args) => {
                const { dataKind } = this.formValues
                for (const kind in dataKind) {
                    dataKind[kind] = this.getDataKind(kind).map((v, index) => isEmpty(v) ? dataKind[kind][index] : v)
                }
                return this.form.submit(...args)
            }

            const { parent, form, index } = this.props

            if (parent && index != null) {
                parent.registerDataKind(this, form.kind, index)
            }
            if (super.UNSAFE_componentWillMount) {
                super.UNSAFE_componentWillMount(...arguments)
            }
        }

        UNSAFE_componentWillUpdate (nextProps, nextState) {
            if (this.state !== nextState) this.meta = null // update changes by UI interactions (i.e. Dropdown onChange)
            if (super.UNSAFE_componentWillUpdate) super.UNSAFE_componentWillUpdate(...arguments)
        }

        UNSAFE_componentWillReceiveProps (next, _) {
            const { data, meta } = this.props
            // external API changes
            if (next.data != null && next.data !== data) {
                this.setState(state => setIn(state, 'data.json', normalizeIncomingData(next.data)))
            }
            // external API changes
            if (next.meta != null && next.meta !== meta) {
                this.setState(state => setIn(state, 'meta.json', next.meta))
            }
            if (super.UNSAFE_componentWillReceiveProps) {
                super.UNSAFE_componentWillReceiveProps(...arguments)
            }
        }

        componentDidUpdate (prevProps, prevState) {
            const { parent, form, index } = this.props
            if (parent && form && index != null && prevProps.index !== index) {
                if (prevProps.index != null) {
                    parent.unregisterDataKind(this, form.kind, prevProps.index)
                }
                parent.registerDataKind(this, form.kind, index)
            }
            if (super.componentDidUpdate) super.componentDidUpdate(...arguments)
        }

        // Nested documents render this class directly — `engine/Data.js` reads it from `Active` to
        // avoid a circular import — so it has to be the layer, not the bare class the caller wrote.
    }

    // const popup = useContext(PopupContext)
    // These are the PARENT's methods now, which is what "the original" always meant.
    withDataKind(UIRenderLifecycle)

    // @Note: the state shape is used for reference only, it is not instantiated
    UIRenderLifecycle.prototype.state = {
        data: {
            json: undefined, // data object
            name: undefined, // file name
        },
        meta: {
            json: undefined, // data object
            name: undefined, // file name
        },
    }

    Object.defineProperty(UIRenderLifecycle.prototype, 'config', {
        get () {
            const data = this.data
            const { form, parent } = this.props
            // Fetch a file through the host's `downloadFile` and save it (see `download.js`). The API
            // call is read at click time, as it always was.
            FIELD.FUNC[FIELD.ACTION.DOWNLOAD] = (...args) => download(args, {
                downloadFile: this.getAPICalls().downloadFile,
                onFailure: err => this.popupAlert(err, _.DOWNLOAD_FAILED_),
            })
            // Send the forms' values and a file through the host's `uploadFile`, and make its answer
            // the data (see `upload.js`). The remount key and the form restart wait for the new data
            // to be committed, as they always did.
            FIELD.FUNC[FIELD.ACTION.UPLOAD] = (...args) => upload(args, {
                uploadFile: this.getAPICalls().uploadFile,
                readFormsData: this.getAllFormsData,
                onUploaded: normalizedResponse => this.setState({
                    data: {
                        json: normalizedResponse
                    }
                }, () => {
                    this.setState({ key: new Date() })
                    this.form.restart(normalizedResponse)
                }),
            })
            // Add current Form values to parent UI Render instance.state
            FIELD.FUNC[FIELD.ACTION.ADD_DATA] = (parent && form)
                ? () => {
                    // Call form submit to run validation
                    if (!this.canSave) return this.handleSubmit()
                    const registeredValues = this.registeredValues
                    const rel = this.props.meta && this.props.meta.relativePath
                    const dataKindPath = dataKindPathFor(this.props.meta, form.kind, this.dataKindPath)
                    const existingLen = get(parent.state.data.json, `${dataKindPath}.${form.kind}`, []).length
                    const rowObject = rowObjectForDataKindAppend(registeredValues, rel, existingLen)
                    pushDataKindRow({
                        parentUIRender: parent,
                        meta: this.props.meta,
                        kind: form.kind,
                        rowObject,
                        fallbackDataKindPath: this.dataKindPath || ''
                    })
                    this.form.restart()
                    const rememberedTouched = touchedFor(this.form)
                    this.form.getRegisteredFields().forEach(field => {
                        delete rememberedTouched[field]
                    })
                }
                : dataActionWarning
            // Remove current Form values from parent UI Render instance.state
            FIELD.FUNC[FIELD.ACTION.REMOVE_DATA] = (parent && form)
                // The form, meta and index are read at click time and the instance is the one
                // captured here, exactly as before (see `removeDataKindRow`).
                ? () => removeDataKindRow({
                    parentUIRender: parent,
                    parentForm: this.props.parent.props.instance.form,
                    meta: this.props.meta,
                    kind: form.kind,
                    index: this.props.index,
                    fallbackDataKindPath: this.dataKindPath,
                })
                : dataActionWarning

            // Popup Content Opening
            FIELD.FUNC[FIELD.ACTION.POPUP_OPEN] = (...args) => {
                // Which popup, and with what — `popupArgs.js`, testable on its own.
                const parsed = parsePopupArgs(args)
                if (!parsed) return
                const { id, options } = parsed
                
                // First, try to find popup by exact ID (may be already interpolated)
                let popup = this.popupById && this.popupById[id]
                if (popup) {
                    const { content, title = '', ...props } = popup
                    this.popupAlert(title, content, { ...props, ...options })
                    return
                }
                
                // If ID contains template variables or not found, try to find template
                if (id && (id.includes('{') || this.popupTemplates)) {
                    // The whole four-source chain lives in `popupScope.js`, testable on its own.
                    const currentForm = this.form || this.props.form || form
                    const { relativeIndex, relativeData, relativePath } = resolvePopupScope({
                        id,
                        form: currentForm,
                        props: this.props,
                    })
                    
                    // Now create interpolationVars with the determined values
                    const interpolationVars = {
                        index: relativeIndex,
                        value: relativeData
                    }
                    
                    // Which registered template the id means, and the key it was found by —
                    // `popupTemplate.js`, testable on its own.
                    const found = findPopupTemplate(this.popupTemplates, id, this.props.index)
                    const popupTemplate = found && found.popupTemplate
                    const templateId = found ? found.templateId : id

                    if (popupTemplate) {
                        // Interpolate ID if needed (if template ID contains {index})
                        // If ID already interpolated, use it as-is
                        const interpolatedId = templateId.includes('{') 
                            ? interpolateString(templateId, interpolationVars, { suppressError: true })
                            : id
                        
                        // Create new PopupContent with current context
                        // Use the index from interpolation for relativeIndex
                        const { items, data: templateData, _data: templateDataLocal, form: templateForm, instance: templateInstance, relativeIndex: templateRelativeIndex, relativePath: templateRelativePath, relativeData: templateRelativeData, title = '', ...popupProps } = popupTemplate
                        
                        // Row index, array path, row data and document — `popupScope.js`, testable
                        // on its own, including the warning for a row popup with no path.
                        const {
                            data: currentData,
                            relativeIndex: currentRelativeIndex,
                            relativePath: currentRelativePath,
                            rowData: currentRowData,
                        } = resolvePopupRowContext({
                            id,
                            options,
                            scope: { relativeIndex, relativeData, relativePath },
                            template: popupTemplate,
                            props: this.props,
                            data: this.data,
                        })
                        const instanceForm = this.form || this.props.form
                        const currentForm = templateForm || instanceForm
                        const currentInstance = templateInstance || this

                        // Check if items exist and are not empty
                        if (!items || !Array.isArray(items) || items.length === 0) {
                            console.error('Popup items are empty or invalid:', items)
                            this.popupAlert(title || 'Error', 'Popup content is empty', { ...popupProps, ...options })
                            return
                        }
                        
                        // Create PopupContent component - use the same pattern as mapper.js
                        // Pass context through props to ensure data is available
                        class PopupContent extends PureComponent {
                            render () {
                                // `relativeData` is deliberately not read: every mapped item below hardcodes
                                // `relativeData: false` so Render never re-extracts by name.
                                const { items, data, _data, form, instance, relativeIndex, relativePath, currencyCode } = this.props
                                
                                // Map items with current data context, similar to how Render.js does it
                                // IMPORTANT: Always pass relativePath and relativeIndex to ensure correct field IDs
                                // Set relativeData to false to prevent Render.js from automatically extracting data by name
                                // This ensures _data remains the single row element, not the entire array
                                const mappedItems = items.map((item) => {
                                    const mappedItem = {
                                        ...item,
                                        data,
                                        _data,
                                        form,
                                        instance,
                                        relativeIndex,
                                        relativePath,
                                        relativeData: false, // Prevent automatic data extraction by name in Render.js
                                        currencyCode
                                    }
                                    // Ensure relativePath and relativeIndex are always set (not just for TableCells)
                                    // These are critical for generating correct field IDs in forms
                                    // Also set them in meta.relativePath and meta.relativeIndex so they are passed through metaToProps
                                    if (relativePath != null) {
                                        mappedItem.relativePath = relativePath
                                        // Set in meta object so metaToProps can access it
                                        if (!mappedItem.meta) mappedItem.meta = {}
                                        mappedItem.meta.relativePath = relativePath
                                    }
                                    if (relativeIndex != null) {
                                        mappedItem.relativeIndex = relativeIndex
                                        // Set in meta object so metaToProps can access it
                                        if (!mappedItem.meta) mappedItem.meta = {}
                                        mappedItem.meta.relativeIndex = relativeIndex
                                    }
                                    return mappedItem
                                })
                                // Pass relativePath and relativeIndex to Render component itself
                                // This ensures they are available in Render.props and passed down correctly
                                // Set relativeData to false to prevent Render.js from automatically extracting data by name
                                // This ensures _data remains the single row element throughout the render tree
                                // Add key prop to avoid React warning about missing keys
                                return mappedItems.map((item, idx) => Render({
                                    ...item,
                                    relativePath,
                                    relativeIndex,
                                    relativeData: false, // Prevent automatic data extraction by name in Render.js
                                    key: item.id || item.name || `popup-item-${idx}`
                                }))
                            }
                        }
                        
                        const content = <PopupContent 
                            items={items}
                            data={currentData}
                            _data={currentRowData}
                            form={currentForm}
                            instance={currentInstance}
                            relativeIndex={currentRelativeIndex}
                            relativePath={currentRelativePath}
                            relativeData={false}
                            currencyCode={currentInstance.state?.currencyCode}
                        />
                        
                        // Cache the popup with interpolated ID for future use
                        if (!this.popupById) this.popupById = {}
                        if (!this.popupById[interpolatedId]) {
                            this.popupById[interpolatedId] = { ...popupTemplate, content, title, ...popupProps }
                        }
                        
                        this.popupAlert(title, content, { ...popupProps, ...options })
                        return
                    }
                }
                
                // Fallback to original behavior - try to find by static ID
                const { content, title = '', ...props } = (this.popupById && this.popupById[id]) || {}
                this.popupAlert(title, content, { ...props, ...options })
            }

            // this.data is not updated dynamically at the moment
            // Implemented as temporary solution
            // Writes a changed primitive into EVERY data property with the field's name (see
            // `replaceDeepCopy`). Three things changed here, none of them in what a working call does:
            // the state is no longer rewritten in place before `setState`; a call with no field object
            // — `onClick: {name: 'updateDataOnChange', mapArgs: ['x']}` — is a no-op instead of an
            // uncaught TypeError from destructuring `undefined`; and `Array.isArray(params)` is gone,
            // since a rest parameter is always an array and that test could not fail.
            FIELD.FUNC[FIELD.ACTION.UPDATE_DATA_ON_CHANGE] = (value, ...params) => {
                const name = params[0] && params[0].name
                if (typeof value !== 'object' && name) {
                    this.data = replaceDeepCopy(this.data, name, value)
                }
            }


            // Send every form's values to the host and make its answer the data (see
            // `applyPeriods.js`); a failure shows the host's message in a popup.
            FIELD.FUNC[FIELD.ACTION.ON_APPLY_PERIODS] = () => applyPeriods({
                updateExperienceData: this.getAPICalls().updateExperienceData,
                readFormsData: this.getAllFormsData,
                onUpdated: normalizedResponse => this.setState({
                    data: {
                        json: normalizedResponse
                    }
                }, () => {
                    this.form.restart(normalizedResponse)
                }),
                onFailure: (message, error) => {
                    this.context.setPopupState({
                        isOpen: true,
                        title: 'Error',
                        content: <Json data={{ message }}/>
                    })
                    console.error(error)
                },
            })

            FIELD.METHODS = this.getCalledMethod()

            FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm.bind(this)
            FIELD.FUNC[FIELD.ACTION.SET_STATE] = this.setStates.bind(this)
            FIELD.FUNC[FIELD.ACTION.FETCH] = fetch
            FIELD.FUNC[FIELD.ACTION.POPUP] = this.popupAlert
            FIELD.FUNC[FIELD.ACTION.SUBMIT] = this.submit

            return {
                data,
                form: this.form,
                instance: this,
                funcConfig: {
                    data,
                    fieldFunc: { ...FIELD.FUNC }, // bind definition to this instance
                    fieldNormalizer: { ...FIELD.NORMALIZER },
                    fieldParser: { ...FIELD.PARSER },
                    fieldValidation: { ...FIELD.VALIDATION },
                    fieldMethods: { ...FIELD.METHODS },
                }
            }
        }
    })

    Active.UIRender = UIRenderLifecycle

    return withForm({
        subscription: {
            pristine: true,
            valid: true,
            values: true,
            touched: true
        },
        // Handed in rather than imported by the form module: see the note on `withForm`.
        processErrors: errorsProcessing,
    })(UIRenderLifecycle)
}

const dataActionWarning = (e) => console.warn('Missing parent UI Render instance to modify form values!', e)
