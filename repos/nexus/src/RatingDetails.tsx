import React, {Component} from 'react'

const UI_RENDER = 'ui-render' // used by css for class name
interface Props {
    style?: object
    className?: string
    dataUrl: string
    metaUrl: string
    _id?: string
}

export default class RatingDetails extends Component<Props, any> {

    private _id: string | undefined

    get id() {
        if (!this._id) return this._id = uuid()
        return this._id
    }

    // Mount UI Render to given DOM element by ID
    componentDidMount() {
        // @ts-ignore
        if (!document._renderRatingDetails) return console.error(`window._renderRatingDetails is required for ${this.constructor.name}!`)
        const {dataUrl, metaUrl} = this.props
        // @ts-ignore
        document._renderRatingDetails({id: this.id, dataUrl, metaUrl})
    }

    render() {
        const {dataUrl, metaUrl, className, ...props} = this.props
        return <div id={this.id} className={`${UI_RENDER} ${className || ''}`} {...props}/>
    }
}


/**
 * Create RFC4122 Complaint Version 4 UUID
 *
 * @see: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * @returns {String} uuid - in this format 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx'
 */
function uuid() {
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
