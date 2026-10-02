import React, { Fragment, isValidElement } from 'react'
import '../modules/form/constants'
import { withForm } from '../modules/form'
import { FIELD } from '../modules/variables'
import { cn } from '../components'
import Json from '../components/JsonView'
import ScrollView from '../components/ScrollView'
import { Active, get, interpolateString, isEmpty, isList, isString, round, sanitizeResponse } from '../utils'
// `set` mutates and `setIn` copies: `set` is for objects this file has just built (the local
// `update` below), `setIn` for anything React has already been handed, i.e. `this.state`.
// Every `setIn` on state goes through the UPDATER form: an immutable copy built from `this.state`
// would be built from the state as it was before any other update in the same batch, so two
// writes into one container would undo each other. The mutating version had no such problem,
// which is why this is not a detail of the rewrite but the point of it.
import { cloneDeep, hasObjectValue, isObject as isPlainObject, set, setIn } from '../utils/object'
import Render, { metaToProps } from './index'
import './mapper' // Set up UI Renderer components and methods
import { cancelAutoSubmit } from './autoSubmit'
import { DocumentInstance, hostDocument } from './documentHost'
import { statePathOf } from './statePath'
import { describeFailure, download } from './download'
import { upload } from './upload'
import { applyPeriods } from './applyPeriods'
import { parsePopupAlertArgs, parsePopupArgs } from './popupArgs'
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
import Modal from './components/Modal'
import { createPopupContent } from './components/PopupContent'
import type { FormApi } from 'final-form'
import type { UploadArgs } from './upload'
import type { Translate } from '../utils/_envs'
import { dataKindPathFor, getDataKindPathFromRelative, pushDataKindRow, removeDataKindRow, rowObjectForDataKindAppend, compactDataKindArrays, dataKindRowHasContent, validateNotWithinRangeDraftRow } from './dataKindPush'

// Non-narrowing, on purpose: a meta node checked with it stays open JSON, instead of becoming the
// `Record<string, unknown>` the util's type guard narrows it to.
const isObject: (value: unknown) => boolean = isPlainObject

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
export function parseArrayPrefixAndRowIndexFromFieldName (fieldName: unknown): { arrayPrefix: string, rowIndex: number } | null {
    if (!fieldName || typeof fieldName !== 'string') return null
    const m = fieldName.match(/^(.*)\[(\d+)\]\.[^.[]+$/)
    if (!m) return null
    return { arrayPrefix: m[1], rowIndex: Number(m[2]) }
}

/**
 * Cross-row period overlap validation. Uses final-form (allValues, meta.name) + per-field `instance` closure
 * so row index stays correct after FieldArray.remove (global FIELD.VALIDATION reassignment from `config` was not safe).
 */
/**
 * A document instance, as the validator and the registry read it. `any`: it is the engine's class with
 * both layers over it, whose members each layer adds in its own class body.
 */
type DocumentInstanceLike = any

function notWithinRangeValidator (value: unknown, { dataKind, args: argsIn }: { dataKind?: string, args?: string[] } = {}, allValues?: Record<string, any>, meta?: { name?: string }, instance?: DocumentInstanceLike) {
    const args = argsIn || []
    const [start, end] = args
    if (!start || !end || !dataKind) return undefined

    const fromName = meta && meta.name ? parseArrayPrefixAndRowIndexFromFieldName(meta.name) : null
    let rowIndexNum = fromName != null && !Number.isNaN(fromName.rowIndex) ? fromName.rowIndex : null

    let relativePath: string | null = null
    if (instance && instance.props) {
        const propsMeta = instance.props.meta
        relativePath = (propsMeta && propsMeta.relativePath) || instance.props.relativePath
        const ri = (propsMeta && propsMeta.relativeIndex != null) ? propsMeta.relativeIndex : instance.props.relativeIndex
        if (rowIndexNum == null && ri != null && ri !== '' && !Number.isNaN(Number(ri))) {
            rowIndexNum = Number(ri)
        }
    }

    const valuesRoot = allValues || (instance && instance.formValues)
    let _a: unknown
    let _b: unknown
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
    const ranges: Array<[unknown, unknown]> = []
    const thisIndex = form && form.kind === dataKind && rowIndexNum != null && !Number.isNaN(rowIndexNum)
        ? String(rowIndexNum)
        : null
    if (isList(valuesBy)) {
        for (let i = 0; i < valuesBy.length; i++) {
            if (thisIndex != null && String(i) === thisIndex) continue
            const row = valuesBy[i]
            if (row == null || typeof row !== 'object') continue
            // Casts, not guards: an object, a row of a data kind.
            const a = (row as Record<string, unknown>)[start]
            const b = (row as Record<string, unknown>)[end]
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
    [FIELD.NORMALIZE.DATE]: (val: any) => {
        if (val) {
            const date = new Date(val)
            return getDateStringFromDateObject(date)
        }
    },
    [FIELD.NORMALIZE.CURRENCY]: (v: any) => v == null ? v : Number((v || 0) || 0).toFixed(2),
    [FIELD.NORMALIZE.PERCENT]: (v: any) => {
        return v == null ? v : (Number((v || 0) || 0) * 100).toLocaleString()
    },
}
FIELD.PARSER = {
    ...FIELD.PARSER,
    [FIELD.NORMALIZE.PERCENT]: function fromPercent (v: any) {
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
 *
 * A document's instance, not a React component, since §9.3 step 6: a function component hosts it,
 * `documentHost.ts`, which gives it what React gave a class. That is why it extends
 * `DocumentInstance`, and why its props sync is `deriveFromProps`.
 */
/**
 * A document's props: the meta and data it renders, and the host's callbacks. Each is documented
 * where a host reads it, in the published `UIRender.UIRenderProps` (`src/library/contract.ts`);
 * open here, because the engine reads them by key and rewrites meta and data as JSON.
 */
export type UIRenderProps = Record<string, any>

/**
 * What the layers over this class give its instance: the engine layer (`Decorator`, below), then the
 * form layer (`withFormSetup`, in `modules/form`). Declared by merging rather than as fields, so no
 * instance gets an own property in front of the getters those layers define on their prototypes.
 */
export interface UIRender {
    readonly data: any
    readonly meta: any
    readonly hasData: boolean
    readonly hasMeta: boolean
    readonly form: FormApi
    readonly handleSubmit: (event?: React.SyntheticEvent) => unknown
}

export class UIRender extends DocumentInstance {
    static contextType = AppContext

    // Type-only: the constructor sets each when the host gives it one, and Babel emits no field.
    errorHandler?: (errors: object) => void
    translate?: Translate

    constructor (props: UIRenderProps) {
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
            this.translate = (value: unknown) => typeof value === 'string' ? translate(value) : value
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

    // The document's one sync of `data` and `meta` from its props. Until §9.3 step 6 the engine
    // layer had a second one over it, which set the same two paths with updaters just before this
    // ran; this one's update was applied last, so what the state ended up with was always this
    // one's, and that is what stays. It takes a `data` prop that became null as no data, which the
    // other one skipped (`rules.instance-contract.test.js`).
    //
    // It was `UNSAFE_componentWillReceiveProps`. The host calls it at the same point, during the
    // render, and it still sets nothing but this document's state (`documentHost.ts`).
    deriveFromProps (next: UIRenderProps) {
        const update: Record<string, any> = {}
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

    onDataChanged: (() => void) | undefined = undefined

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
                <Modal />
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

const UIRenderWithUISetup = Decorator(UIRender)
export default UIRenderWithUISetup


/**
 * Transform *_meta.json API response into custom rules applied by the team
 */
export function transformConfig (meta: any) {
    return toOpenLConfig(sanitizeResponse(meta || {}, { tags: [] }))
}

export function toOpenLConfig (meta: any): any {
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
            // A cast, not a guard: the first header, open JSON like the rest of the meta.
            const firstHeader = get(meta.headers, '[0]') as Record<string, any>
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
export function initSelectStatesFromData (meta: any, data: unknown, instance: DocumentInstanceLike, contextPath?: string): void {
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
                            const idx = optionsList.findIndex((o: unknown) => String(get(o, mapValue)) === String(value))
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
 * React Class Decorator to setup UI with necessary variables and function definitions
 * @usage:
 *    - this.data -> *_data.json from state, ready for <Render> component consumption
 *    - this.meta -> transformed *_meta.json data from state, ready for <Render> component consumption
 *    - this.handleSubmit:
 *        1. final-form: to be used like this <form onSubmit={this.handleSubmit}>
 *    - this.hasData and this.hasMeta getters can be used for conditional check
 *    - Initialize with data by overriding initial state
 */

function Decorator (Class: any) {
    /**
     * THE LIFECYCLE LAYER, AS ITS OWN CLASS (§9.3 step 5).
     *
     * Everything below used to be written onto `UIRenderLifecycle.prototype` — the caller's class, mutated in
     * place at module load. That is what made the engine invisible to anything reasoning about the
     * component tree, and it meant the exported `UIRender` was a different object before and after
     * this module was imported. The layer now lives on a subclass of its own, so the class handed
     * in is left exactly as it was written and `super` reaches genuine parent methods.
     *
     * It is not the class that renders, though: `withForm` renders a subclass of it in turn, the form
     * layer that `withFormSetup` builds, and that is what `Active.UIRender` names (the end of this
     * function). The chain is the class the caller wrote, this layer, then the form layer.
     *
     * Every member below is written as a member, `config` and the nested-Data registry included.
     * One thing deliberately is NOT:
     *
     * `state` stays a prototype assignment because the form layer builds its own from it —
     * `FormSetup.prototype.state = {…, ...Class.prototype.state}` in `withFormSetup` — so a class
     * FIELD, which initialises per instance after `super()` returns, would leave that merge reading
     * `undefined` and drop the engine's state shape. Two test harnesses read `prototype.state`
     * directly for the same reason.
     *
     * `config` was installed by `Object.defineProperty` until §9.3 step 2 had lifted most of its
     * action handlers into modules of their own. Writing it as a member changed one thing, the
     * descriptor's `configurable` (false → true), and nothing depends on that: `get meta` is its only
     * reader, nothing in `src` enumerates prototype members, and the form layer over this one
     * defines no `config` of its own.
     *
     * The registry — `getDataKindPath`, `registerDataKind`, `unregisterDataKind`, `getDataKind` —
     * was the `withDataKind` mixin until it was written into this class (see the end of it). The
     * methods stopped being enumerable, which is the one thing that changed; nothing in `src`
     * enumerates an instance or a prototype.
     */
    class UIRenderLifecycle extends Class {
        get data () {
            return get(this.state, 'data.json')
        }
        // A setter returns nothing: what `setState` returned was always dropped.
        set data (value: unknown) {
            this.setState((state: object) => setIn(state, 'data.json', value))
        }

        /**
         * Built once for each state object, from that state. `{state.x}` names resolve and the
         * handlers are composed when it is built, so a new state needs a new one. A render that
         * brings no new state, such as a parent's render, reuses it: every node keeps its handlers,
         * and a memoised component can skip its render. `rules.meta-cache.test.js` pins both. Until
         * §9.3 step 6 an `UNSAFE_componentWillUpdate` dropped the cache whenever an update brought
         * a new state; keying the cache on the state does the same without a lifecycle.
         */
        get meta () {
            if (this._meta != null && this._metaState === this.state) return this._meta
            const state = this.state
            const transformedMeta = transformConfig(cloneDeep(get(state, 'meta.json')))
            // Pre-initialize state from data for Select/Dropdown fields,
            // so {state.xxx} interpolation resolves correctly on the first render
            initSelectStatesFromData(transformedMeta, this.data, this)
            this._meta = metaToProps(transformedMeta, this.config)
            this._metaState = state
            return this._meta
        }

        get config () {
            const data = this.data
            const { form, parent } = this.props
            // Fetch a file through the host's `downloadFile` and save it (see `download.js`). The API
            // call is read at click time, as it always was.
            FIELD.FUNC[FIELD.ACTION.DOWNLOAD] = (...args) => download(args, {
                downloadFile: this.getAPICalls().downloadFile,
                onFailure: err => this.popupAlert(describeFailure(err), _.DOWNLOAD_FAILED_),
            })
            // Send the forms' values and a file through the host's `uploadFile`, and make its answer
            // the data (see `upload.js`). The remount key and the form restart wait for the new data
            // to be committed, as they always did.
            // A cast, not a guard: what `Upload` calls the action with.
            FIELD.FUNC[FIELD.ACTION.UPLOAD] = (...args) => upload(args as UploadArgs, {
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
                    // A cast, not a guard: the rows there, or the `[]` fallback.
                    const existingLen = (get(parent.state.data.json, `${dataKindPath}.${form.kind}`, []) as unknown[]).length
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
                    this.form.getRegisteredFields().forEach((field: string) => {
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
                // Which popup, and with what — `popupArgs.ts`, testable on its own.
                const parsed = parsePopupArgs(args)
                if (!parsed) return
                const { id, options } = parsed
                
                // First, try to find popup by exact ID (may be already interpolated)
                let popup = this.popupById && this.popupById[id]
                if (popup) {
                    const { content, title = '' } = popup
                    this.popupAlert(title, content)
                    return
                }
                
                // If ID contains template variables or not found, try to find template
                if (id && (id.includes('{') || this.popupTemplates)) {
                    // The whole four-source chain lives in `popupScope.ts`, testable on its own.
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
                    // `popupTemplate.ts`, testable on its own.
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
                        
                        // Row index, array path, row data and document — `popupScope.ts`, testable
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
                            this.popupAlert(title || 'Error', 'Popup content is empty')
                            return
                        }
                        
                        // A FRESH component type per template popup, on purpose — see `PopupContent.tsx`.
                        const PopupContent = createPopupContent()

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
                        
                        this.popupAlert(title, content)
                        return
                    }
                }
                
                // Fallback to original behavior - try to find by static ID
                const { content, title = '' } = (this.popupById && this.popupById[id]) || {}
                this.popupAlert(title, content)
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
            // `applyPeriods.ts`); a failure shows the host's message in a popup.
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
            // Bound to this document, and given the title and content that `popupArgs.ts` reads from
            // the caller's arguments and the meta's. It used to be `popupAlert` itself, unbound, so
            // from 2025-04-17, when the alert moved onto the context, every call threw on
            // `this.context`. Fixed 2026-09-29.
            FIELD.FUNC[FIELD.ACTION.POPUP] = (...args) => {
                const { title, content } = parsePopupAlertArgs(args)
                this.popupAlert(title, content)
            }
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
        setStates (value: unknown, ...rest: unknown[]) {
            // The state path is the LAST STRING argument, not the second positional one: see
            // `statePath.ts` for why. The `{state.x}` templates re-resolve on the render this
            // schedules, because the meta cache is keyed on the state object (`get meta`). Until
            // §9.3 step 6 this also cleared the cache, which that key had made redundant.
            const keyPath = statePathOf(rest)
            return this.setState((state: object) => setIn(state, keyPath, value))
        }

        resetForm () {
            this.form.reset()
        }

        // A title and a content, and nothing else: that is all the popup shows. Every `popupOpen` path
        // used to hand a third argument too, a popup's own props merged with the options it was
        // opened with. No version of this method ever read it; the first, in 2020, took
        // `(title, content)` as this one does. The row context in those options is read where it is
        // used, by `resolvePopupRowContext`.
        popupAlert (title: unknown, content?: unknown) {
            // An element is shown as it is, and a value as a JSON tree. No content means no body:
            // `Json` requires its `data`, and warned whenever there was nothing to show, for a `popup`
            // action with nothing configured and for a `popupOpen` of an id nothing registered.
            this.context.setPopupState({
                isOpen: true,
                title: title,
                content: content === undefined || isValidElement(content) ? content : <Json data={content}/>
            })
        }

        componentWillUnmount (nextProps?: unknown, nextState?: unknown) {
            const { parent, form, index } = this.props
            if (parent && index != null) parent.unregisterDataKind(this, form.kind, index)
            // A change typed just before unmount must not submit a form the user has left.
            cancelAutoSubmit(this)
            if (super.componentWillUnmount) super.componentWillUnmount(...arguments)
        }

        // Wrap form.submit with HOC to extract nested form values before submission. A member from
        // the constructor on, because the meta's `submit` action is built from it when the first
        // render builds the meta (`rules.mount-order.test.js`).
        submit = (...args: unknown[]) => {
            const { dataKind } = this.formValues
            for (const kind in dataKind) {
                dataKind[kind] = this.getDataKind(kind).map((v: unknown, index: number) => isEmpty(v) ? dataKind[kind][index] : v)
            }
            return this.form.submit(...args)
        }

        componentDidMount () {
            // A nested document registers with its parent in the commit, before any mount effect
            // runs: its fields validate in theirs, and a cross-row validator reads the scope this
            // sets (`rules.mount-order.test.js`). Until §9.3 step 6 it registered in
            // `UNSAFE_componentWillMount`, before render.
            const { parent, form, index } = this.props
            if (parent && index != null) {
                parent.registerDataKind(this, form.kind, index)
            }
            if (super.componentDidMount) super.componentDidMount(...arguments)
        }

        componentDidUpdate (prevProps: UIRenderProps, prevState: unknown) {
            const { parent, form, index } = this.props
            if (parent && form && index != null && prevProps.index !== index) {
                if (prevProps.index != null) {
                    parent.unregisterDataKind(this, form.kind, prevProps.index)
                }
                parent.registerDataKind(this, form.kind, index)
            }
            if (super.componentDidUpdate) super.componentDidUpdate(...arguments)
        }

        // THE NESTED-DATA REGISTRY. These four were the `withDataKind` mixin, assigned onto this
        // prototype after the class; it had no other consumer, so they are members like the rest.

        getDataKindPath (relativePath: string | null | undefined, kind: string) {
            return getDataKindPathFromRelative(relativePath, kind)
        }

        // Register child instance from parent instance.
        // Registry is scoped by dataKindPath so that children with the same kind+index
        // from different parent rows (2-level nesting) do not overwrite each other.
        // Structure: this.dataKind[kind][scope][index] = instance
        registerDataKind (instance: DocumentInstanceLike, kind: string, index: number | string) {
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
        unregisterDataKind (instance: DocumentInstanceLike, kind: string, index: number | string) {
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
        getDataKind (kind: string, scope?: string): any[] {
            let base: string | undefined
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
            return get(dataJson, pathToDataKindArray, []) as any[] // a cast, not a guard: the rows, or `[]`
        }
    }

    // const popup = useContext(PopupContext)

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

    const UIRenderWithForm = withForm({
        subscription: {
            pristine: true,
            valid: true,
            values: true,
            touched: true
        },
        // Handed in rather than imported by the form module: see the note on `withForm`.
        processErrors: errorsProcessing,
        // The document is an instance of the layers, hosted by a function component (§9.3 step 6).
        host: hostDocument,
    })(UIRenderLifecycle)

    // Nested documents render the wrapper's own component directly — `engine/Data.tsx` reads it from
    // `Active` to avoid a circular import — so it has to be what the wrapper renders: the host of this
    // layer with the form layer over it, not the bare class the caller wrote. The host carries the
    // class it hosts as `InstanceClass`.
    Active.UIRender = UIRenderWithForm.WrappedComponent

    return UIRenderWithForm
}

const dataActionWarning = (e: unknown) => console.warn('Missing parent UI Render instance to modify form values!', e)
