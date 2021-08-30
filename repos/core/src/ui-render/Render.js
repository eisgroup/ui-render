"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var lodash_1 = require("lodash");
var utils_1 = require("./utils");
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
function Render(props, index) {
    return react_1.default.createElement(RenderClass, __assign({}, props, { key: typeof index !== 'object' ? index : undefined }));
}
exports.default = Render;
var RenderClass = /** @class */ (function (_super) {
    __extends(RenderClass, _super);
    function RenderClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            error: false,
        };
        return _this;
    }
    RenderClass.prototype.componentDidMount = function () {
        // @ts-ignore
        if (!Render.Component)
            throw new Error("Please setup Render.Component mapper first");
        // @ts-ignore
        if (!Render.Method)
            throw new Error("Please setup Render.Method mapper first");
    };
    RenderClass.prototype.componentDidCatch = function (error, errorInfo) {
        var _this = this;
        this.setState({ error: error }, function () { return Render.onError({ error: error, errorInfo: errorInfo, props: _this.props }); });
    };
    /**
     * @Note: try block only catches error in this Render function,
     * Errors in components will propagate up to componentDidCatch in parent class.
     */
    RenderClass.prototype.render = function () {
        if (this.state.error)
            return String(this.state.error);
        // Wrap component with Tooltip automatically
        // @ts-ignore
        if (this.props.tooltip != null) {
            // @ts-ignore
            var _a = this.props, tooltip = _a.tooltip, props_1 = __rest(_a, ["tooltip"]);
            var tooltipProps = __assign(__assign({}, Render.TooltipDefaultProps), utils_1.isObject(tooltip) ? tooltip : { title: tooltip });
            // @ts-ignore
            return react_1.default.createElement(Render.Tooltip, __assign({}, tooltipProps), Render(props_1));
        }
        // @ts-ignore
        var _b = this.props, data = _b.data, _data = _b._data, debug = _b.debug, form = _b.form, items = _b.items, relativeData = _b.relativeData, relativePath = _b.relativePath, relativeIndex = _b.relativeIndex, view = _b.view, props = __rest(_b, ["data", "_data", "debug", "form", "items", "relativeData", "relativePath", "relativeIndex", "view"]);
        // Global/Relative Data access
        // @ts-ignore
        if (props.name)
            _data = lodash_1.get((relativeData !== false && _data) || data, props.name); // local data dynamically retrieved from definition
        // Pass down data to child renderers
        items = items.map(function (item) { return (__assign({ data: data, _data: _data, debug: debug, form: form }, item)); }); // allow `data` and `_data` to be overridden by config
        // @ts-ignore
        return Render.Component.call(this, __assign(__assign({}, this.props), { _data: _data, items: items }));
    };
    RenderClass.defaultProps = {
        items: []
    };
    return RenderClass;
}(react_1.Component));
Render.onError = function (error) { return console.warn("Unhandled " + Render.name + " error:", error); };
Render.TooltipDefaultProps = { inverted: true };
