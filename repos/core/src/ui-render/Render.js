import React, { Component } from 'react'
import { get, isObject } from 'ui-utils-pack'

/**
 * Recursive Field Renderer
 * @setup:
 *      // mapper.js
 *      import { Render } from 'ui-render'
 *      import TooltipPop from 'ui-react-pack/TooltipPop'
 *
 *      // Setup common components/callbacks
 *      Render.Tooltip = TooltipPop
 *      Render.TooltipDefaultProps = {inverted: true}
 *      Render.onError = handleErrorCallback // usually, open a Popup to show error message
 *
 *      // Render Component resolver for `view` definitions in meta.json
 *      Render.Component = function RenderComponent ({
 *          view, items, data, _data, debug, form, showIf,
 *          relativeData, relativeIndex, relativePath,version,
 *          ...props
 *      }) {
 *        switch (view) {
 *          case FIELD.TYPE.ROW:
 *            return <Row {...props}>{items.map(Render)}</View>
 *          // ...map all other components needed for the UI
 *        }
 *      }
 *
 *      // Render Function resolver for `render...` definitions in meta.json
 *      Render.Method = function RenderMethod (Name) {
 *        switch (Name) {
 *          case FIELD.RENDER.PERCENT:
 *            return (val, index, {decimals} = {}) => toPercent(val, decimals)
 *          case FIELD.RENDER.TITLE_n_INPUT:
 *            return (val, index, {id, ...props} = {}) => <Row {...props}><Text>{val}</Text></Row>
 *          // ...map all other methods needed for the UI
 *        }
 *      }
 *
 * @param {*} [props] - React component props to pass to given field
 * @param {Number|String} [index] - index of field in the list
 * @returns {*} Node - React component/s
 */
export default function Render (props, index) {
    return <RenderClass {...props} key={typeof index !== 'object' ? index : undefined}/>
}

class RenderClass extends Component {
    static defaultProps = {
        items: []
    }

    state = {
        error: false,
    }

    componentDidMount () {
        // @ts-ignore
        if (!Render.Component) throw new Error(`Please setup Render.Component mapper first`)
        // @ts-ignore
        if (!Render.Method) throw new Error(`Please setup Render.Method mapper first`)
    }

    componentDidCatch (error, errorInfo) {
        this.setState({error}, () => Render.onError({error, errorInfo, props: this.props}))
    }

    /**
     * @Note: try block only catches error in this Render function,
     * Errors in components will propagate up to componentDidCatch in parent class.
     */
    render () {
        if (this.state.error) return String(this.state.error)

        // Wrap component with Tooltip automatically
        if (this.props.tooltip != null) {
            // @ts-ignore
            const {tooltip, ...props} = this.props
            const tooltipProps = {...Render.TooltipDefaultProps, ...isObject(tooltip) ? tooltip : {title: tooltip}}
            // @ts-ignore
            return <Render.Tooltip {...tooltipProps}>{Render(props)}</Render.Tooltip>
        }

        let {data, _data, debug, form, instance, items, relativeData, name} = this.props

        // Global/Relative Data access
        if (name) _data = get((relativeData !== false && _data) || data, name) // local data dynamically retrieved from definition

        // Pass down data to child renderers
        // allow `data` and `_data` to be overridden by config
        items = items.map((item) => {
            const mappedData = {data, _data, debug, form, instance, ...item};
            if (this.props.view === 'TableCells' && this.props.relativeIndex !== undefined) {
                mappedData.relativePath = this.props.relativePath;
                mappedData.relativeIndex = this.props.relativeIndex;
            }

            return mappedData;
        })

        // return Render.Component.call(this, {...this.props, _data, items})
        return <Render.Component
          {...this.props}
          _data={_data}
          items={items}
         />
    }
}

Render.onError = (error) => console.warn(`Unhandled ${Render.name} error:`, error)

Render.TooltipDefaultProps = {inverted: true}
