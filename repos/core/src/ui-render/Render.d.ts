/// <reference types="react" />
/** Exposing Interface of the UI Renderer */
export interface RenderProps {
    /** Data.json - global data object to be passed down to child components */
    data: any;
    /** Local data retrieved from data.json by the component using `name` attribute */
    _data: any;
    /** Raises certain errors if true, defaults to suppress errors */
    debug: boolean;
    /** FormApi instance from react-final-form @see: https://final-form.org/docs/final-form/types/FormApi */
    form: any;
    /** Nested fields (their props) to be rendered inside the component */
    items?: Array<any>;
    /** Whether to retrieve values from local `_data`, defaults to global `data` */
    relativeData: boolean;
    /** Path used to compute form input "name" attribute when nested inside other parent components */
    relativePath: string;
    /** Index position of the component when rendered as array (also used to compute form input.name) */
    relativeIndex: number | string;
    /** Component type (one of FIELD.TYPE values. Example: 'Row', 'Table', 'PieChart', etc.) */
    view: string;
}
export interface RenderError {
    /** Error Boolean sent by React componentDidCatch */
    error: any;
    /** Error Info Object sent by React componentDidCatch */
    errorInfo: any;
    /** React props of the component that caused the error */
    props: any;
}
/**
 * Recursive Field Renderer
 * @setup:
 *      // mapper.js
 *      import { Render } from 'ui-render'
 *      import TooltipPop from 'react-ui-pack/TooltipPop'
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
declare function Render(props: any, index?: number | string): JSX.Element;
declare namespace Render {
    var onError: (error: RenderError) => void;
    var TooltipDefaultProps: {
        inverted: boolean;
    };
}
export default Render;
