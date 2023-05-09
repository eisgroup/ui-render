import React, {Component} from 'react'

const UI_RENDER = 'ui-render' // used by css for class name

interface Props {
    // Required if `data` or `meta` omitted
    dataUrl?: string
    metaUrl?: string

    // Required if `dataUrl` or `metaUrl` omitted
    data?: object
    meta?: object
    initialValues?: object
    onSubmit(formValues: object): void
    getFormData?(fn: Function): void
    onDataChanged?(): void
    getValidationErrors?(errors: object): void
    methods?: Record<string, Function>
    apiCalls?: {
        updateExperienceData?: (data: any) => Promise<any>
        downloadFile?: (fileName: string) => Promise<any>
        uploadFile?: (data: string, file: Blob) => Promise<any>
    }

    // Optional
    className?: string
    style?: object
    id?: string
    translate(v: string): string
}

/**
 * Thin wrapper to avoid compiling UI Render inside Genesis UI Build process,
 * because they have limited TypeScript build config that cannot process npm packages using pure JS in ES6.
 *
 * UI Render makes use of many npm packages written in pure JS using ES6 for these reasons:
 *      - Automatic tree shaking to optimize production bundle size by removing unused code imported from npm packages
 *      - IDE instant function/variable suggestions and automatic import
 *      - Easier for developers to read source code of imported npm packages, than reading compiled minified code.
 *
 * @logic:
 *      1. This Component creates an empty <div/> inside Genesis UI HTML DOM (where UI Render wil be)
 *      2. When mounted, it calls global `window._mountUIRender` method defined in `/repos/policy/src/main.js`
 *      3. Above method mounts pre-bundled UI Render to the above created <div/>, initiating UI Render instance.
 *      4. On subsequent prop changes, it passes them to UI Render via <DOMProxy/> container
 *         (this is a workaround hack for Genesis UI).
 */
export class UIRender extends Component<Props, any> {
    // tslint:disable:variable-name
    private _id: string | undefined
    private _instance: any

    // tslint:disable:typedef
    get id() {
        if (!this._id) {
            return (this._id = this.props.id || uuid())
        }
        return this._id
    }

    onMount = (instance: any) => this._instance = instance

    // Mount UI Render to given DOM element by ID
    // tslint:disable:typedef
    componentDidMount() {
        // @ts-ignore
        if (!window._mountUIRender) {
            return console.error(`window._mountUIRender is required for ${this.constructor.name}!`)
        }
        const {id, className, style, ...props} = this.props
        // @ts-ignore
        window._mountUIRender({...props, id: this.id, onMount: this.onMount})
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any) {
        if (!this._instance) return
        const {id, className, style, ...props} = this.props
        this._instance.setState(props) // pass updates to UI Render
    }

    render() {
        const {className, style} = this.props
        return <div id={this.id} data-version='0.29.3' className={`${UI_RENDER} ${className || ''}`} style={style}/>
    }
}

export default UIRender

/**
 * Create RFC4122 Complaint Version 4 UUID
 *
 * @see: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * @returns {String} uuid - in this format 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx'
 */
function uuid(): string {
    // tslint:disable:no-bitwise
    const d0 = (Math.random() * 0xffffffff) | 0
    const d1 = (Math.random() * 0xffffffff) | 0
    const d2 = (Math.random() * 0xffffffff) | 0
    const d3 = (Math.random() * 0xffffffff) | 0
    return (
        lut[d0 & 0xff] +
        lut[(d0 >> 8) & 0xff] +
        lut[(d0 >> 16) & 0xff] +
        lut[(d0 >> 24) & 0xff] +
        '-' +
        lut[d1 & 0xff] +
        lut[(d1 >> 8) & 0xff] +
        '-' +
        lut[((d1 >> 16) & 0x0f) | 0x40] +
        lut[(d1 >> 24) & 0xff] +
        '-' +
        lut[(d2 & 0x3f) | 0x80] +
        lut[(d2 >> 8) & 0xff] +
        '-' +
        lut[(d2 >> 16) & 0xff] +
        lut[(d2 >> 24) & 0xff] +
        lut[d3 & 0xff] +
        lut[(d3 >> 8) & 0xff] +
        lut[(d3 >> 16) & 0xff] +
        lut[(d3 >> 24) & 0xff]
    )
}

const lut: any[] = []
for (let i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16)
}
