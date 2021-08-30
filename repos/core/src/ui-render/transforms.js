"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaToProps = exports.mapProps = void 0;
var utils_1 = require("./utils");
var lodash_1 = require("lodash");
var Render_1 = __importDefault(require("./Render"));
var FUNCTION_NAMES = ['onClick', 'onChange', 'onDone'];
/**
 * Map Data by given Mapper definition
 *
 * @param {Array|*} data - to map
 * @param {Object|String} mapper - object of key / value pairs (value being key path from `data`), or key path string
 * @param {Boolean} [debug] - whether to raise silenced error if data is missing or of incorrect type
 * @returns {Array} list - mapped from given data
 */
function mapProps(data, mapper, _a) {
    var debug = (_a === void 0 ? {} : _a).debug;
    var mapData = typeof mapper === 'string' ? function (item) { return lodash_1.get(item, mapper, item); } : function (item, index) {
        var result = {};
        for (var key in mapper) {
            // `index` must be converted to string to match fallback value defined in config (which can only be string)
            // fallback to item if key not found
            result[key] = mapper[key] === '{index}' ? String(index) : lodash_1.get(item, mapper[key], item);
        }
        return result;
    };
    return (debug ? data : utils_1.toList(data, true)).map(mapData);
}
exports.mapProps = mapProps;
/**
 * Recursively map meta.json declarations to props ready for rendering (by mutation)
 * @Note: this function must only transform config, without adding data.
 *  Because data is added at runtime on Render.
 *
 * @param {Object} meta - json
 * @param {*} config
 * @returns {Object} props - mutated meta
 */
function metaToProps(meta, config) {
    var _this = this;
    var instance = config.instance, // contains dynamic `state` to hydrate meta data
    relativePath = config.relativePath, relativeIndex = config.relativeIndex, funcConfig = config.funcConfig;
    var data = config.data, _data = config._data;
    // Transform Root attributes
    if (utils_1.isObject(meta)) {
        metaToFunctions(meta, __assign(__assign({}, funcConfig), { data: data }));
        if (meta.name)
            meta.name = utils_1.interpolateString(meta.name, instance, { suppressError: true });
    }
    var _loop_1 = function (attribute) {
        var definition = meta[attribute];
        if (!definition)
            return "continue";
        // Map `onClick` functions by name (if exists)
        // @Note: high priority, because onClick string will be bound to `self` class inside `render` functions
        if (utils_1.isObject(definition)) {
            metaToFunctions(definition, __assign(__assign({}, funcConfig), { data: data }));
            if (definition.name)
                definition.name = utils_1.interpolateString(definition.name, instance, { suppressError: true });
        }
        // Map Value Renderer Names/Objects to Actual Render Functions
        if (attribute.indexOf('render') === 0) {
            if (typeof definition === 'string') { // @ts-ignore
                meta[attribute] = Render_1.default.Method(meta[attribute]);
            }
            // Below transformation only happens during render
            if (utils_1.isObject(definition))
                meta[attribute] = function (value, index, props, self) {
                    _data = value;
                    // Render is a field definition
                    if (definition.view) {
                        var name_1 = definition.name, filterItems = definition.filterItems, configs = __rest(definition, ["name", "filterItems"]);
                        var revPath = { relativePath: meta.name || relativePath, relativeIndex: index };
                        return Render_1.default(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, revPath), props), metaToProps(lodash_1.cloneDeep(configs), __assign(__assign(__assign({}, config), revPath), { data: data, _data: _data }))), name_1 && { name: utils_1.interpolateString(definition.name, { index: index, value: value }) }), definition.index && { index: utils_1.interpolateString(definition.index, { index: index }) }), filterItems && { filterItems: filterItems, parentItem: value }), utils_1.removeNilValues(FUNCTION_NAMES.map(function (func) {
                            var _a;
                            return utils_1.isString(definition[func]) && self &&
                                !getFunctionFromString(definition[func], __assign(__assign({}, funcConfig), { fallback: null })) && (_a = {}, _a[func] = self[definition[func]], _a);
                        })).reduce(function (obj, item) { return (__assign(__assign({}, obj), item)); }, {})), { data: data,
                            _data: _data }), index);
                    }
                    // Render is a function definition
                    else if (definition.name) {
                        var func = getFunctionFromObject(definition, __assign(__assign({}, funcConfig), { data: data }));
                        // @ts-ignore
                        return utils_1.isFunction(func) ? func.apply(_this, [value, index, __assign(__assign(__assign({}, props), definition), { data: data, _data: _data })])
                            : func;
                    }
                    // Render is conditional match by values definitions
                    else if (definition.values) {
                        var valueDefinition = definition.values[value] || definition.default;
                        if (!valueDefinition)
                            return value;
                        return (utils_1.isObject(valueDefinition))
                            ? (valueDefinition.view
                                ? Render_1.default(__assign(__assign(__assign({}, props), valueDefinition), { data: data, _data: _data }), index)
                                : getFunctionFromObject(valueDefinition, __assign(__assign({}, funcConfig), { data: data })) // @ts-ignore
                                    .apply(_this, [value, index, __assign(__assign(__assign({}, props), valueDefinition), { data: data, _data: _data })])) // @ts-ignore
                            : Render_1.default.Method(valueDefinition).apply(_this, [value, index, __assign(__assign({}, props), { data: data, _data: _data })]);
                    }
                };
        }
        // Process nested Object/List definitions
        else if (utils_1.isCollection(definition)) {
            var attrCount = Object.keys(definition).length;
            if ( // this condition check must match exact case immediately, so that other cases get transformed
            attribute !== 'showIf' && definition.name != null &&
                (attrCount === 1 || (attrCount === 2 && definition.relativeData != null))) {
                // Value Transform {name} - single key objects with name to their values
                // fallback to `name` attribute for transformed values from `state` (i.e. Tab.index, Dropdown.value...)
                // noinspection PointlessBooleanExpressionJS
                meta[attribute] = utils_1.isString(definition.name)
                    ? lodash_1.get((definition.relativeData !== false && _data) || data, definition.name, definition.name)
                    : definition.name;
                // Leave this to help users debug unresolved values
                if (meta[attribute] === definition.name && utils_1.isString(definition.name) && isNaN(+definition.name))
                    console.warn(meta.view + "." + attribute, definition, '\n❌Not found! relative _data:', _data);
            }
            else {
                // Recursively process the rest of definitions
                // Relative path must always be passed down, because nested Inputs inside List require absolute path for `name`
                var options = { data: data, _data: _data, instance: instance, relativePath: meta.name || relativePath, relativeIndex: relativeIndex };
                // Resolve local `_data` for nested definitions
                // noinspection PointlessBooleanExpressionJS
                if (meta.relativeData !== false && meta.name != null)
                    options._data = lodash_1.get(_data || data, meta.name, _data);
                meta[attribute] = metaToProps(meta[attribute], __assign(__assign({}, config), options));
            }
        }
    };
    for (var attribute in meta) {
        _loop_1(attribute);
    }
    // Pass down relative path to nested views
    if (meta.view) {
        if (relativePath != null && meta.relativePath == null)
            meta.relativePath = relativePath;
        if (relativeIndex != null && meta.relativeIndex == null)
            meta.relativeIndex = relativeIndex;
    }
    return meta;
}
exports.metaToProps = metaToProps;
/**
 * Transform Function Definition strings to actual methods, if they exist, by mutation
 * @example:
 *    const definition = {onChange: 'functionName'}
 *    >>> {onChange: Function}
 *
 * @param {Object} definition - containing function names
 * @param {Object} config
 * @returns {void} definition - with names replaced by functions (by mutation)
 */
function metaToFunctions(definition, config) {
    var fieldValidation = config.fieldValidation, fieldNormalizer = config.fieldNormalizer, fieldFunc = config.fieldFunc, _a = config.funcNames, funcNames = _a === void 0 ? FUNCTION_NAMES : _a;
    /* react-final-form does not support validate as array, like redux-form */
    // const validations = toList(definition.validate)
    // if (isString(validations[0])) definition.validate = removeNilValues(validations.map(id => FIELD.VALIDATION[id]))
    if (utils_1.isString(definition.validate))
        definition.validate = fieldValidation[definition.validate];
    if (utils_1.isString(definition.format))
        definition.format = fieldNormalizer[definition.format];
    if (utils_1.isString(definition.parse))
        definition.parse = fieldNormalizer[definition.parse];
    if (utils_1.isString(definition.normalize))
        definition.normalize = fieldNormalizer[definition.normalize];
    funcNames.forEach(function (name) {
        if (utils_1.isString(definition[name])) {
            definition[name] = getFunctionFromString(definition[name], { fieldFunc: fieldFunc });
        }
        else if (utils_1.isObject(definition[name])) {
            definition[name] = getFunctionFromObject(definition[name], config);
        }
    });
}
/**
 * Get Function/s from Definition Object Recursively
 * @example:
 *    getFunctionFromObject({name: 'reset', args: [0], onDone: 'setState,active.plan'})
 *    >>> function (...argumentsSuppliedFromCaller) {
 *          return setState(reset(...argumentsSuppliedFromCaller, 0), 'active.plan')
 *        }
 *
 * @param {Object<name, args, onDone>} definition - of function to call
 *    - @param {String} name - of the function
 *    - @param {Array} [args] - last arguments to pass to the function
 *    - @param {String|Object} [onDone] - callback recursive function definitions
 * @param {Object} config
 * @returns {Function|String} method - that receives caller arguments as its first arguments,
 *    and will chain function calls `onDone` recursively
 */
function getFunctionFromObject(definition, config) {
    var name = definition.name, mapArgs = definition.mapArgs, _a = definition.args, args = _a === void 0 ? [] : _a, onDone = definition.onDone;
    var data = config.data, fieldFunc = config.fieldFunc, _b = config.fallback, fallback = _b === void 0 ? definition.name : _b;
    var func = fieldFunc[name];
    if (onDone)
        metaToFunctions(definition, config);
    if (func) {
        var hasMapArgs_1 = utils_1.isList(mapArgs);
        if (utils_1.isFunction(definition.onDone)) {
            return function () {
                var values = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    values[_i] = arguments[_i];
                }
                // @ts-ignore
                if (hasMapArgs_1)
                    values = mapArgs.map(function (val) { return mapFunctionArgs(val, { data: data, args: values }); });
                var result = func.apply(void 0, __spreadArrays(values, args));
                // @ts-ignore
                if (result instanceof Promise)
                    return result.then(definition.onDone);
                // @ts-ignore
                return definition.onDone(result);
            };
        }
        else {
            return function () {
                var values = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    values[_i] = arguments[_i];
                }
                // @ts-ignore
                if (hasMapArgs_1)
                    values = mapArgs.map(function (val) { return mapFunctionArgs(val, { data: data, args: values }); });
                return func.apply(void 0, __spreadArrays(values, args));
            };
        }
    }
    // @ts-ignore
    return func || Render_1.default.Method(name) || fallback;
}
/**
 * Get Function from Definition String
 * @example:
 *    getFunctionFromString('reset,0', {fieldFunc: FIELD.FUNC})
 *    >>> function reset(...argumentsSuppliedFromCaller, '0') {...}
 *
 * @param {String} string - name of function to get, with optional arguments, separated by comma
 * @param {*} config
 * @returns {Function|String|*} method - that receives caller arguments as its first arguments,
 *    along with optionally defined arguments in the config string
 */
function getFunctionFromString(string, _a) {
    var fieldFunc = _a.fieldFunc, _b = _a.fallback, fallback = _b === void 0 ? string : _b;
    var _c = string.split(','), name = _c[0], args = _c.slice(1);
    var func = fieldFunc[name];
    return ((args.length && func) ? (function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        return func.apply(void 0, __spreadArrays(arg, args));
    }) : func) || fallback;
}
/**
 * Map function arguments definition to actual values
 * @param {*} template - for the argument to be transformed
 * @param {*} options
 * @returns {*} argument transformed with given options
 */
function mapFunctionArgs(template, _a) {
    var data = _a.data, args = _a.args;
    if (utils_1.isString(template))
        return utils_1.interpolateString(utils_1.interpolateString(template, args, { suppressError: true }), data, { suppressError: true });
    if (utils_1.isCollection(template)) {
        for (var key in template) {
            template[key] = mapFunctionArgs(template[key], { data: data, args: args });
        }
    }
    return template;
}
