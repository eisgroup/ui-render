import React, { Component, Fragment, isValidElement } from 'react'
import { storedTouched, withForm } from 'ui-modules-pack/form'
import { FIELD } from 'ui-modules-pack/variables'
import { cn, type } from 'ui-react-pack'
import Json from 'ui-react-pack/JsonView'
import ScrollView from 'ui-react-pack/ScrollView'
import { Active, get, isEmpty, isList, isString, round, sanitizeResponse } from 'ui-utils-pack'
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

        this.togglePopupState = ({ title = '', content = '' }) => {
            if (title && content) {
                this.setState({
                    isPopupOpen: true,
                    popupTitle: title,
                    popupContent: content
                })
            } else {
                this.setState({
                    isPopupOpen: false,
                    popupTitle: '',
                    popupContent: ''
                })
            }
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
            togglePopupState: this.togglePopupState,
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

    const callOnDataChanged = (props) => {
        if (props
            && props.instance
            && props.instance.props
            && props.instance.props.parent
            && typeof props.instance.props.parent.onDataChanged === 'function'
        ) {
            props.instance.props.parent.onDataChanged()
        }
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
                // The first argument can be Button Event
                if (typeof args[0] === 'object') args.shift()
                // noinspection JSCheckFunctionSignatures
                const [id, options] = args
                const { [id]: { content, title = '', ...props } = {} } = this.popupById || {}
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

                    this.togglePopupState({
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
