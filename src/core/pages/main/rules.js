import React, { Component, Fragment, PureComponent, isValidElement } from 'react'
import { storedTouched, withForm } from 'ui-modules-pack/form'
import { FIELD } from 'ui-modules-pack/variables'
import { cn, type } from 'ui-react-pack'
import Json from 'ui-react-pack/JsonView'
import ScrollView from 'ui-react-pack/ScrollView'
import { Active, get, interpolateString, isEmpty, isList, isString, round, sanitizeResponse } from 'ui-utils-pack'
import { cloneDeep, hasObjectValue, isObject, set } from 'ui-utils-pack/object'
import Render, { metaToProps } from '../../ui-render'
import './mapper' // Set up UI Renderer components and methods
import { _ } from './translations'
import {
    replaceDeep,
    getFormsData,
    mapErrorObjectToUIFormat,
    getDateStringFromDateObject,
    errorsProcessing,
    normalizeIncomingData
} from './utils'
import deepEqual from 'deep-equal'
import { downloadFile as downloadFileProcessing } from '../../services/downloadFile'
import { double5, integer, phone, uppercase } from 'ui-react-pack/inputs/normalizers'
import { AppContext } from '../../contexts'
import Popup from './components/Popup'

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
FIELD.TYPE = {
    AUTO_SUBMIT: 'AutoSubmit',
    DATA: 'Data',
    ICON: 'Icon',
    IMAGE: 'Image',
    LINK: 'Link',
    POPUP: 'Popup',
    TABLE_CELLS: 'TableCells',
}
FIELD.CROSS_VALIDATE = {
    NOT_WITHIN_RANGE: 'notWithinRange',
}
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

/*
  FormStorage is used for storing all active forms.
  This solution provides ability to get data from all forms
 */
export const formsStorage = new Map()

/*
  Accumulate validation errors from all Form instances
 */
export let errorsMap = {}

let errorHandlerFunction = undefined

export const clearErrorsMap = () => {
    errorsMap = {}
}

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
        dateFormat: type.String,
    }

    constructor (props) {
        super(props)
        if (typeof props.getValidationErrors === 'function') {
            errorHandlerFunction = props.getValidationErrors
        }
        if (typeof props.translate === 'function') {
            Active.translate = props.translate
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

        if (typeof errorHandlerFunction === 'function'
            && !deepEqual(errorsMap, this.state.errors)
        ) {
            const errors = cloneDeep(errorsMap)
            errorHandlerFunction(mapErrorObjectToUIFormat(errors))
            this.setState({ errors })
        }
    }

    getAllFormsData = () => {
        // TODO: investigate realisation with this.data
        // this.data contains related data but there no all changes
        return getFormsData(formsStorage)
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
        const { childBefore, childAfter, form, embedded, className, style, translate, parent, dateFormat } = this.props
        const { key } = this.state

        const content = this.hasData && this.hasMeta &&
            <Render
                key={key}
                data={this.data}
                {...this.meta}
                form={this.form || parent.form}
                instance={parent || this}
                translate={translate}
                onDataChanged={this.onDataChanged}
                currencyCode={this.state.currencyCode}
                dateFormat={dateFormat}
            />
        const Container = embedded ? Fragment : ScrollView
        const props = embedded ? undefined : {
            fill: true,
            className: cn('ui__render fade-in bg-neutral', className),
            style,
        }

        if (parent) {
            return <Container {...props}>
                {childBefore}
                {(form && !embedded) ? <form onSubmit={this.handleSubmit} {...form}>{content}</form> : content}
                {childAfter}
            </Container>
        }

        return (
            <Container {...props}>
                {childBefore}
                {(form && !embedded) ? (content ||
                    <form onSubmit={this.handleSubmit} {...form}>{content}</form>) : content}
                {childAfter}
                <Popup />
            </Container>
        )
    }
}

UIRender.contextType = AppContext

const UIRenderWithUISetup = Decorator(UIRender)
export default UIRenderWithUISetup

Active.UIRender = UIRender

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
            if (view === FIELD.TYPE.DROPDOWN) {
                meta.onChange = FIELD.ACTION.SET_STATE + ',' + meta.name
            }
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
 * Decorator to extend UI Render instance with nested Data component interface
 */
export function withDataKind (Class) {
    Class.prototype.getDataKindByRelativePath = function (dataJson) {
        if (!this.dataKindPath) {
            return dataJson
        }

        return get(dataJson, this.dataKindPath)
    }

    Class.prototype.getDataKindPath = function (relativePath, kind) {
        const pathToData = `.dataKind.${kind}`
        if (relativePath.includes(pathToData)) {
            return relativePath.replace(pathToData, '')
        }

        return ''
    }

    // Register child instance from parent instance
    Class.prototype.registerDataKind = function (instance, kind, index) {
        if (!this.dataKind) this.dataKind = {}
        if (!this.dataKind[kind]) this.dataKind[kind] = {}
        this.dataKind[kind][index] = instance
        this.dataKindPath = this.getDataKindPath(instance.props.meta.relativePath, kind)
    }

    // Unregister child instance from parent instance
    Class.prototype.unregisterDataKind = function (instance, kind, index) {
        if (!this.dataKind) {
            this.dataKind = {}
        }
        if (this.dataKind[kind] && this.dataKind[kind][index]) {
            delete this.dataKind[kind][index]
        }
    }

    /**
     * Retrieve current forms' values for given data kind, with fallback to data in state
     * @param {String}kind - Data component kind
     * @param {Number} [index] - Data component index
     * @returns {Array|Object|Undefined} all forms values by index array, or form values for given index object, else undefined
     */
    Class.prototype.getDataKind = function (kind) {
        const dataJson = getFormsData(formsStorage)
        const pathToDataKindArray = this.dataKindPath ? this.dataKindPath + '.dataKind.' + kind : 'dataKind.' + kind

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
    // const popup = useContext(PopupContext)
    const componentWillUnmount = Class.prototype.componentWillUnmount
    const UNSAFE_componentWillMount = Class.prototype.UNSAFE_componentWillMount
    const UNSAFE_componentWillUpdate = Class.prototype.UNSAFE_componentWillUpdate
    const UNSAFE_componentWillReceiveProps = Class.prototype.UNSAFE_componentWillReceiveProps
    withDataKind(Class)

    // @Note: the state shape is used for reference only, it is not instantiated
    Class.prototype.state = {
        data: {
            json: undefined, // data object
            name: undefined, // file name
        },
        meta: {
            json: undefined, // data object
            name: undefined, // file name
        },
    }

    // Define instance getter
    Object.defineProperty(Class.prototype, 'config', {
        get () {
            const data = this.data
            const { form, parent, index } = this.props
            // Download file from URL
            FIELD.FUNC[FIELD.ACTION.DOWNLOAD] = (...args) => {
                // The first argument can be Button Event
                if (typeof args[0] === 'object') args.shift()
                const [fileName] = args
                const { downloadFile } = this.getAPICalls()
                if (typeof downloadFile !== 'function') {
                    return false
                }
                downloadFile(fileName)
                    .then(response => response.blob())
                    .then(downloadFileProcessing(fileName))
                    .catch(err => this.popupAlert(err, _.DOWNLOAD_FAILED_))
            }
            // File upload
            FIELD.FUNC[FIELD.ACTION.UPLOAD] = async (files, path, dropzoneRef) => {
                const { uploadFile } = this.getAPICalls()
                const [file] = files
                if (file && typeof uploadFile === 'function') {
                    const data = this.getAllFormsData()
                    delete data[path]
                    try {
                        const response = await uploadFile(JSON.stringify(data), file)
                        const normalizedResponse = normalizeIncomingData(response)
                        dropzoneRef.fileInputEl.value = null
                        this.setState({
                            data: {
                                json: normalizedResponse
                            }
                        }, () => {
                            this.setState({ key: new Date() })
                            this.form.restart(normalizedResponse)
                        })
                    } catch (error) {
                        console.error(error)
                    }
                }
            }
            // Add current Form values to parent UI Render instance.state
            FIELD.FUNC[FIELD.ACTION.ADD_DATA] = (parent && form)
                ? () => {
                    // Call form submit to run validation
                    if (!this.canSave) return this.handleSubmit()
                    const registeredValues = this.registeredValues
                    // Add directly to data.json, to keep all data patterns consistent, and to enable backend override.
                    // And store a copy in state for rehydration when backend updates response without added data.
                    const { data } = parent.state
                    const dataKindPath = parent.dataKindPath ? `${parent.dataKindPath}.dataKind` : 'dataKind'
                    const dataKind = get(data.json, dataKindPath)
                    dataKind[form.kind] = [...dataKind[form.kind] || [], registeredValues]
                    const parentForm = this.props.parent.props.instance.form
                    parentForm.mutators.push(`${dataKindPath}.${form.kind}`, registeredValues)
                    this.form.restart()
                    this.form.getRegisteredFields().forEach(field => {
                        delete storedTouched[field]
                    })
                }
                : dataActionWarning
            // Remove current Form values from parent UI Render instance.state
            FIELD.FUNC[FIELD.ACTION.REMOVE_DATA] = (parent && form)
                ? () => {
                    const { data } = parent.state
                    const dataKindPath = parent.dataKindPath ? `${parent.dataKindPath}.dataKind` : 'dataKind'
                    const dataKind = get(data.json, dataKindPath)
                    const array = [...dataKind[form.kind] || []]
                    array.splice(index, 1)
                    dataKind[form.kind] = array
                    const parentForm = this.props.parent.props.instance.form
                    parentForm.mutators.remove(`${dataKindPath}.${form.kind}`, index)
                }
                : dataActionWarning

            // Popup Content Opening
            FIELD.FUNC[FIELD.ACTION.POPUP_OPEN] = (...args) => {
                // Filter out event objects (React SyntheticEvent or native Event)
                const filteredArgs = args.filter(arg => {
                    if (typeof arg !== 'object' || arg === null) return true
                    // Check if it's an event object
                    if (arg.nativeEvent || arg.target || arg.preventDefault || arg.stopPropagation) {
                        return false
                    }
                    // Check if it's a React component class
                    if (arg.prototype && arg.prototype.isReactComponent) {
                        return false
                    }
                    return true
                })
                
                // noinspection JSCheckFunctionSignatures
                // Handle different argument formats: [id, options] or [id] or [options with id]
                let id, options = {}
                if (filteredArgs.length === 0) {
                    console.error('Popup Open: no arguments provided after filtering')
                    return
                }
                if (typeof filteredArgs[0] === 'string') {
                    id = filteredArgs[0]
                    options = filteredArgs[1] || {}
                } else if (typeof filteredArgs[0] === 'object' && filteredArgs[0] !== null) {
                    // If first arg is object, it might be options with id, or just options
                    options = filteredArgs[0]
                    id = filteredArgs[1] || options.id
                } else {
                    id = String(filteredArgs[0])
                    options = filteredArgs[1] || {}
                }
                
                // Ensure id is a string
                if (typeof id !== 'string' || !id) {
                    console.error('Popup Open: id must be a non-empty string, got:', typeof id, id)
                    return
                }
                
                // Extract relativePath and relativeIndex from options if provided
                // These come from renderItem context and ensure popup fields match table row fields
                const contextRelativePath = options.relativePath
                const contextRelativeIndex = options.relativeIndex
                
                // First, try to find popup by exact ID (may be already interpolated)
                let popup = this.popupById && this.popupById[id]
                if (popup) {
                    const { content, title = '', ...props } = popup
                    this.popupAlert(title, content, { ...props, ...options })
                    return
                }
                
                // If ID contains template variables or not found, try to find template
                if (id && (id.includes('{') || this.popupTemplates)) {
                    // Try to get index and path from multiple sources
                    let relativeIndex = null
                    let relativeData = null
                    let relativePath = null
                    
                    // First, try to extract index from already interpolated ID (e.g., "InforceRateOverrideReason.0" -> 0)
                    if (/\.\d+$/.test(id)) {
                        const idMatch = id.match(/\.(\d+)$/)
                        if (idMatch) {
                            relativeIndex = parseInt(idMatch[1], 10)
                        }
                    }
                    
                    // Get form from instance (this.form) or props
                    const currentForm = this.form || this.props.form || form
                    
                    // 1. Try from props (only if not already set from options)
                    if (relativeIndex == null && this.props.relativeIndex != null) {
                        relativeIndex = this.props.relativeIndex
                        relativeData = this.props._data
                        if (relativePath == null) {
                            relativePath = this.props.relativePath
                        }
                    }
                    // 2. Try from form context (only if relativeIndex not already set)
                    else if (relativeIndex == null && currentForm && typeof currentForm.getState === 'function' && index != null) {
                        relativeIndex = index
                        relativeData = currentForm.getState().values
                        relativePath = this.props.relativePath
                    }
                    // 3. Try to extract from form path (e.g., "name[0]" -> 0 and "name")
                    // Only if relativeIndex not already set
                    else if (relativeIndex == null && currentForm && typeof currentForm.getState === 'function' && this.props.relativePath) {
                        const pathMatch = this.props.relativePath.match(/\[(\d+)\]/)
                        if (pathMatch) {
                            relativeIndex = parseInt(pathMatch[1], 10)
                            // Extract base path (e.g., "experienceRatingInputs.uwOverridesCoverage" from "experienceRatingInputs.uwOverridesCoverage[0]")
                            relativePath = this.props.relativePath.replace(/\[\d+\]$/, '')
                        } else {
                            relativePath = this.props.relativePath
                        }
                        relativeData = currentForm.getState().values
                    }
                    // 4. Try to extract index and path from form field names
                    // Only if relativeIndex not already set
                    else if (relativeIndex == null && currentForm && typeof currentForm.getState === 'function') {
                        const formState = currentForm.getState()
                        const registeredFields = Object.keys(formState.values || {})
                        // Look for field names that contain array indices
                        for (const fieldName of registeredFields) {
                            const match = fieldName.match(/^(.+)\[(\d+)\]/)
                            if (match) {
                                relativePath = match[1]
                                relativeIndex = parseInt(match[2], 10)
                                break
                            }
                        }
                        relativeData = formState.values
                    }
                    
                    // Now create interpolationVars with the determined values
                    const interpolationVars = {
                        index: relativeIndex,
                        value: relativeData
                    }
                    
                    // Try to find popup by template ID
                    // If ID already interpolated (e.g., "InforceRateOverrideReason.0"), 
                    // try to find template by pattern (e.g., "InforceRateOverrideReason.{index}")
                    let popupTemplate = null
                    let templateId = id
                    
                    if (this.popupTemplates) {
                        // First try exact match
                        popupTemplate = this.popupTemplates[id]
                        
                        // If not found and ID looks interpolated (contains number at the end), try to find template
                        if (!popupTemplate && /\.\d+$/.test(id)) {
                            // Extract base name and try to find template with {index}
                            const baseName = id.replace(/\.\d+$/, '')
                            templateId = `${baseName}.{index}`
                            popupTemplate = this.popupTemplates[templateId]
                            
                            // If still not found, try to find any template that matches the pattern
                            if (!popupTemplate) {
                                const templateKeys = Object.keys(this.popupTemplates)
                                const matchingTemplate = templateKeys.find(key => {
                                    const templatePattern = key.replace(/\{index\}/g, '\\d+')
                                    const regex = new RegExp(`^${templatePattern}$`)
                                    return regex.test(id)
                                })
                                if (matchingTemplate) {
                                    templateId = matchingTemplate
                                    popupTemplate = this.popupTemplates[matchingTemplate]
                                }
                            }
                        }
                    }
                    if (popupTemplate) {
                        // Interpolate ID if needed (if template ID contains {index})
                        // If ID already interpolated, use it as-is
                        const interpolatedId = templateId.includes('{') 
                            ? interpolateString(templateId, interpolationVars, { suppressError: true })
                            : id
                        
                        // Create new PopupContent with current context
                        // Use the index from interpolation for relativeIndex
                        const { items, data: templateData, _data: templateDataLocal, form: templateForm, instance: templateInstance, relativeIndex: templateRelativeIndex, relativePath: templateRelativePath, relativeData: templateRelativeData, title = '', ...popupProps } = popupTemplate
                        
                        // Get current data and form context from UIRender instance
                        // Use relativeData (current row data) if available, otherwise fall back to template data
                        const currentData = templateData || this.data
                        // Get form from instance (this.form) or props, fallback to template form
                        const instanceForm = this.form || this.props.form
                        const currentForm = templateForm || instanceForm
                        const currentInstance = templateInstance || this
                        // Use contextRelativeIndex from options (renderItem context) with highest priority
                        // This ensures popup fields match the exact table row that opened the popup
                        const currentRelativeIndex = contextRelativeIndex != null ? contextRelativeIndex : (relativeIndex != null ? relativeIndex : templateRelativeIndex)
                        // Use current row data if available (from interpolation), otherwise use template data
                        // If relativeData is an array, extract the element at currentRelativeIndex
                        let currentRowData = relativeData != null ? relativeData : templateDataLocal
                        // If currentRowData is an array and we have an index, extract the specific element
                        if (Array.isArray(currentRowData) && currentRelativeIndex != null && currentRelativePath) {
                            // Try to get the specific row from the table
                            const tableData = get(currentData, currentRelativePath)
                            if (Array.isArray(tableData) && tableData[currentRelativeIndex] != null) {
                                currentRowData = tableData[currentRelativeIndex]
                            } else if (currentRowData[currentRelativeIndex] != null) {
                                currentRowData = currentRowData[currentRelativeIndex]
                            }
                        }
                        
                        // Get correct relativePath for current table row context
                        // Use contextRelativePath from options (renderItem context) with highest priority
                        // This ensures popup fields match the exact table row that opened the popup
                        // relativePath should be the table name (e.g., "experienceRatingInputs.uwOverridesCoverage")
                        let currentRelativePath = contextRelativePath != null ? contextRelativePath : (relativePath || this.props.relativePath || templateRelativePath)
                        
                        // If relativePath still not found, try to determine from table structure
                        // Look for table name in currentData (e.g., experienceRatingInputs.uwOverridesCoverage)
                        if (!currentRelativePath && currentData && currentRelativeIndex != null) {
                            // Try common table paths
                            const possiblePaths = [
                                'experienceRatingInputs.uwOverridesCoverage',
                                'experienceRatingInputs.uwOverridesCommon'
                            ]
                            for (const path of possiblePaths) {
                                const tableData = get(currentData, path)
                                if (Array.isArray(tableData) && tableData[currentRelativeIndex] != null) {
                                    currentRelativePath = path
                                    break
                                }
                            }
                        }
                        
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
                                const { items, data, _data, form, instance, relativeIndex, relativePath, relativeData, currencyCode } = this.props
                                
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
            FIELD.FUNC[FIELD.ACTION.UPDATE_DATA_ON_CHANGE] = (value, ...params) => {
                if (typeof value !== 'object' && Array.isArray(params)) {
                    const { name } = params[0]
                    if (name) {
                        replaceDeep(this.data, name, value)
                        this.data = cloneDeep(this.data)
                    }
                }
            }


            FIELD.FUNC[FIELD.ACTION.ON_APPLY_PERIODS] = async () => {
                const { updateExperienceData } = this.getAPICalls()
                if (typeof updateExperienceData !== 'function') {
                    return false
                }
                const data = this.getAllFormsData()

                try {
                    const response = await updateExperienceData(data)

                    if (!response) {
                        return
                    }

                    const normalizedResponse = normalizeIncomingData(response)
                    this.setState({
                        data: {
                            json: normalizedResponse
                        }
                    }, () => {
                        this.form.restart(normalizedResponse)
                    })
                } catch (error) {
                    let message = error
                    // Fix to get error message from Response object
                    if (error instanceof Response) {
                        const errorText = await error.text()
                        const errorObject = JSON.parse(errorText.replace(/(\w+:)|(\w+ :)/g, function (s) {
                            return '"' + s.substring(0, s.length - 1) + '":'
                        }))
                        message = errorObject
                        if (errorObject.message) {
                            message = errorObject.message

                            if (/message=(.*)errors.*/.test(message)) {
                                const subMessage = message.match(/message=(.*)errors.*/)[1]
                                if (subMessage) {
                                    message = subMessage
                                }
                            }
                        }
                    }

                    this.context.setPopupState({
                        isOpen: true,
                        title: 'Error',
                        content: <Json data={{ message }}/>
                    })
                    console.error(error)
                }
            }

            FIELD.METHODS = this.getCalledMethod()

            // Cross UI Render instances validation
            FIELD.VALIDATION[FIELD.CROSS_VALIDATE.NOT_WITHIN_RANGE] = (value, { dataKind, args: [start, end] }) => {
                const { form, index, parent, meta } = this.props
                // get relative path and index to field from formValues
                const { relativeIndex, relativePath } = meta || {}
                let _a, _b

                if (relativePath && typeof relativeIndex === 'number') {
                    _a = get(this.formValues, `${relativePath}.${relativeIndex}.${start}`)
                    _b = get(this.formValues, `${relativePath}.${relativeIndex}.${end}`)
                } else {
                    _a = this.formValues[start]
                    _b = this.formValues[end]
                }

                if (_a !== undefined && _b !== undefined) {
                    if (_a === _b) {
                        return `Start date and end date cannot be the same`
                    } else if (_a === value && _b < _a) {
                        return `Start date cannot be more than end date`
                    } else if (_b === value && _b < _a) {
                        return `End date cannot be less than start date`
                    }
                }
                // Retrieve current state from all Forms, with fallback to parent instance.state
                const valuesBy = parent.getDataKind(dataKind) // this only includes values in `data.dataKind` state
                const ranges = []
                const thisIndex = form.kind === dataKind ? String(index) : null
                for (const i in valuesBy) {
                    if (i === thisIndex) continue
                    const { [start]: a, [end]: b } = valuesBy[i]
                    ranges.push([a, b])
                }

                // Validate against overlap
                if (_a && _b) {
                    // TODO: review this logic
                    const range = ranges.find((([a, b]) => _a < a && b < _b))
                    const error = ranges.find(([start, end]) => start <= value && value <= end)

                    if (range || error) {
                        return `Periods cannot overlap`
                    }
                }

                return undefined
            }
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

    // Define instance getter
    Object.defineProperty(Class.prototype, 'data', {
        get () {
            return get(this.state, 'data.json')
        },
        set (value) {
            return this.setState(set(this.state, 'data.json', value))
        }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'meta', {
        get () {
            if (this._meta != null) return this._meta
            return this._meta = metaToProps(transformConfig(cloneDeep(get(this.state, 'meta.json'))), this.config)
        },
        set (value) {
            return this._meta = value
        }
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'hasData', {
        get () {
            return this.data != null
        },
    })

    // Define instance getter
    Object.defineProperty(Class.prototype, 'hasMeta', {
        get () {
            return !isEmpty(this.meta)
        },
    })

    // Define instance method
    // @Note: functions should have consistent pattern of receiving important arguments first,
    // followed by optional arguments.
    // Positional arguments was chosen instead of keyword arguments because
    // it provides more flexibility and separation of concerns between different configs.
    Class.prototype.setStates = function (value, keyPath) {
        return this.setState(set(this.state, keyPath, value))
    }

    // Define instance method
    Class.prototype.resetForm = function () {
        this.form.reset()
    }

    // Define instance method
    Class.prototype.popupAlert = function (title, content) {
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

    Class.prototype.componentWillUnmount = function (nextProps, nextState) {
        const { parent, form, index } = this.props
        if (parent && index != null) parent.unregisterDataKind(this, form.kind, index)
        if (componentWillUnmount) componentWillUnmount.apply(this, arguments)
    }

    Class.prototype.UNSAFE_componentWillMount = function (nextProps, nextState) {
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
        if (UNSAFE_componentWillMount) {
            UNSAFE_componentWillMount.apply(this, arguments)
        }
    }

    Class.prototype.UNSAFE_componentWillUpdate = function (nextProps, nextState) {
        if (this.state !== nextState) this.meta = null // update changes by UI interactions (i.e. Dropdown onChange)
        if (UNSAFE_componentWillUpdate) UNSAFE_componentWillUpdate.apply(this, arguments)
    }

    Class.prototype.UNSAFE_componentWillReceiveProps = function (next, _) {
        const { data, meta } = this.props
        // external API changes
        if (next.data != null && next.data !== data) {
            this.setState(set(this.state, 'data.json', normalizeIncomingData(next.data)))
        }
        // external API changes
        if (next.meta != null && next.meta !== meta) {
            this.setState(set(this.state, 'meta.json', next.meta))
        }
        if (UNSAFE_componentWillReceiveProps) {
            UNSAFE_componentWillReceiveProps.apply(this, arguments)
        }
    }

    return withForm({
        subscription: {
            pristine: true,
            valid: true,
            values: true,
            touched: true
        }
    })(Class)
}

const dataActionWarning = (e) => console.warn('Missing parent UI Render instance to modify form values!', e)
