import React, { Component, createContext } from 'react'
import { get, isObject } from '../utils'
import { childItemPath, formatMetaPath } from './metaPath'

/**
 * Meta path of the closest enclosing rendered node — see `metaPath.ts` for the
 * notation. Ambient tree position is exactly what context is for, and using it
 * keeps the path out of props: every prop a node carries is spread onto the
 * resolved component and can end up as a DOM attribute (that is how
 * `currencyCode` leaks today), and a diagnostic aid must not add to that.
 */
const MetaPathContext = createContext('')

/** A meta node's props, as the renderer reads them; everything is handed on to `Render.Component`. */
export type RenderProps = {
    view?: string
    /** Filled with `[]` by the class's `defaultProps` when absent */
    items?: RenderProps[]
    data?: unknown
    _data?: unknown
    debug?: unknown
    form?: unknown
    instance?: { state: { currencyCode?: string }, props?: { onError?: unknown } }
    relativeData?: boolean
    relativeIndex?: number | null
    relativePath?: string | null
    name?: string
    currencyCode?: string
    tooltip?: unknown
    /** This node's position in its parent's `items`, set by `Render` and stripped before the resolver */
    metaIndex?: number | string
    dateFormat?: unknown
    [key: string]: unknown
}

/** What a subtree that failed to render is reported as, to the host's `onError` and to `Render.onError`. */
export type RenderErrorReport = {
    error: unknown
    errorInfo?: React.ErrorInfo
    props?: Partial<RenderProps>
    path?: string
    message?: string
}

/**
 * A report as the boundary delivers it: every field set, and `errorInfo.componentStack` a string. That
 * is the published `UIRender.UIRenderErrorReport`, and `src/library/contract.agreement.ts` holds this
 * type to it. `@types/react` 18 and 19 type `componentStack` as possibly missing, so it is passed on as a
 * string, `''` should React give none.
 */
export type DeliveredRenderErrorReport = Required<Omit<RenderErrorReport, 'errorInfo'>> & {
    errorInfo: React.ErrorInfo & { componentStack: string }
}

/**
 * Recursive Field Renderer
 * @setup:
 *      // mapper.tsx
 *      import { Render } from 'ui-render'
 *      import TooltipPop from '../components/TooltipPop'
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
function Render (props: RenderProps, index?: number | string | object) {
    // `dateFormat` is deliberately dropped rather than forwarded: the date format is
    // configuration, and it travels to the components that need it through
    // `ConfigContext` (fed from the `UIRender` props — §9.4). Leaving it in props would
    // spread it onto every resolved component and out into the DOM.
    const {dateFormat, ...rest} = props
    // `items.map(Render)` supplies the array position. React, calling this function as a
    // component, supplies legacy context on 16-18 and `undefined` on 19 instead — hence
    // the object check, which also decides the key.
    const position = typeof index !== 'object' ? index : undefined
    return (
        // `metaIndex` sits BEFORE the spread on purpose. `rest` carries it only when this
        // node is being re-rendered by the Tooltip branch below, which passes the node's own
        // props straight back in; the position it already resolved must win over the absent
        // one this call has, or a tooltipped node would report its parent's path.
        <RenderClass metaIndex={position} {...rest} key={position} />
    )
}

// A separate statement because the registry below merges with the function, and a merged declaration
// cannot be a default export.
export default Render

// The registry `mapper.tsx` fills at load (see `@setup` above). The two hooks set at the end of this
// file are declared by those assignments.
declare namespace Render {
    let Component: React.ComponentType<any> | undefined
    /** A value renderer by its meta name, `(value, index, props) => node`; `undefined` for an unknown name */
    let Method: ((name: string) => ((...args: any[]) => any) | undefined) | undefined
    let Tooltip: React.ComponentType<any>
}

class RenderClass extends Component<RenderProps, { error: unknown, diagnostic: string }> {
    static contextType = MetaPathContext

    static defaultProps = {
        items: []
    }

    state = {
        error: false,
        diagnostic: '',
    }

    /**
     * @returns {String} JSON path of this node inside the meta document, '' at the root
     */
    get metaPath () {
        // A cast, not a guard: the context is `MetaPathContext`'s, a string.
        return childItemPath(this.context as string, this.props.metaIndex)
    }

    componentDidCatch (error: Error, errorInfo: React.ErrorInfo) {
        const props = this.props
        const path = this.metaPath
        const report: DeliveredRenderErrorReport = {
            error,
            errorInfo: {...errorInfo, componentStack: errorInfo.componentStack ?? ''},
            props,
            path,
            message: formatRenderError({error, path, props}),
        }
        this.setState({error, diagnostic: report.message}, () => reportRenderError(report))
    }

    /**
     * @Note: try block only catches error in this Render function,
     * Errors in components will propagate up to componentDidCatch in parent class.
     */
    render () {
        if (this.state.error) return this.state.diagnostic
        if (!Render.Component) throw new Error(`Please setup Render.Component mapper first`)
        if (!Render.Method) throw new Error(`Please setup Render.Method mapper first`)

        // Wrap component with Tooltip automatically
        if (this.props.tooltip != null) {
            const {tooltip, ...props} = this.props
            const tooltipProps = {...Render.TooltipDefaultProps, ...isObject(tooltip) ? tooltip : {title: tooltip}}
            return <Render.Tooltip {...tooltipProps}>{Render(props)}</Render.Tooltip>
        }

        let {data, _data, debug, form, instance, items, relativeData, name, currencyCode} = this.props

        // Set currencyCode from instance if not given
        if (currencyCode === undefined && instance) {
            currencyCode = instance.state.currencyCode
        }

        // Global/Relative Data access
        // Only extract data by name if relativeData is not explicitly false
        // This prevents popup fields from accidentally getting the entire array instead of a single element
        // Exception: Table components always need to extract data by name, regardless of relativeData
        const isTable = this.props.view === 'Table'
        if (name && (relativeData !== false || isTable)) {
            _data = get(_data || data, name) // local data dynamically retrieved from definition
        }

        // Pass down data to child renderers
        // allow `data` and `_data` to be overridden by config
        // Not undefined: the class's `defaultProps` fill it.
        items = items!.map((item) => {
            const mappedData = {data, _data, debug, form, instance, currencyCode, ...item};
            // Always pass relativePath and relativeIndex to child items when available
            // This is critical for popup fields to have correct input names matching table row fields
            // Previously only passed for TableCells, but popup content also needs these values
            if (this.props.relativeIndex !== undefined) {
                mappedData.relativeIndex = this.props.relativeIndex;
            }
            if (this.props.relativePath !== undefined) {
                mappedData.relativePath = this.props.relativePath;
            }
            // Only pass relativeData if it's explicitly set to false (for popups)
            // Don't pass it to Table components, as they need to extract data by name
            // This prevents breaking table data display while still allowing popup fields to work correctly
            // @Note: never override a child that declares its own `relativeData`. A node such as
            // `{view: 'RowList', name: 'Groups[0].Items', relativeData: true}` opts back in to data
            // resolution, and inheriting `false` from an ancestor layout would render it empty.
            if (this.props.relativeData === false && item.relativeData === undefined && item.view !== 'Table') {
                mappedData.relativeData = false;
            }

            return mappedData;
        })

        // `metaIndex` is this node's position, not a component attribute: it is stripped here,
        // at the single point where the engine hands props to the resolver, so it cannot reach
        // a component or the DOM.
        const {metaIndex, ...props} = this.props

        return (
            <MetaPathContext.Provider value={this.metaPath}>
                <Render.Component
                  {...props}
                  _data={_data}
                  items={items}
                  currencyCode={currencyCode}
                 />
            </MetaPathContext.Provider>
        )
    }
}

/**
 * Turn a render-failure report into one readable line.
 *
 * The meta path is what makes such a report actionable: a stack trace from a minified
 * bundle names React internals, while `items[3].items[0]` names the declaration to go
 * and fix. The `view` and `name` of the node are added because they are what a meta
 * author recognises the node by.
 *
 * @param {Object} report - as passed to `Render.onError`
 * @param {Error} report.error - the thrown value
 * @param {String} [report.path] - meta path of the node whose subtree failed
 * @param {Object} [report.props] - props of that node
 * @returns {String} single-line diagnostic
 */
export function formatRenderError ({error, path = '', props = {}}: RenderErrorReport): string {
    const {view, name} = props
    const node = []
    if (view) node.push(`view "${view}"`)
    if (name) node.push(`name "${name}"`)
    return `[ui-render] render error at ${formatMetaPath(path)}`
        + `${node.length ? ` (${node.join(', ')})` : ''}: ${String(error)}`
}

/**
 * Send one report to both channels: the host's `onError` prop, when it passed one, and
 * the library's own sink (`Render.onError`, which `mapper.tsx` installs). Both run — a
 * host hook is an extra channel for reporting, not a way to silence the diagnostic.
 *
 * @param {Object} report - {error, errorInfo, props, path, message}
 * @returns {void}
 */
function reportRenderError (report: DeliveredRenderErrorReport): void {
    // Every rendered node carries the UIRender instance that owns it, which is how a
    // per-instance host hook is reachable from here without threading another prop
    // through the tree (and without a module global, which two UIRenders would share).
    const hook = get(report.props, 'instance.props.onError')
    if (typeof hook === 'function') {
        try {
            hook(report)
        } catch (hookError) {
            // A reporter that throws must not replace the failure it was called to report.
            console.error('[ui-render] the onError hook itself failed:', hookError)
        }
    }
    Render.onError(report)
}

Render.onError = (report: RenderErrorReport) => console.warn(`Unhandled ${Render.name} error:`, report)

Render.TooltipDefaultProps = {inverted: true}
