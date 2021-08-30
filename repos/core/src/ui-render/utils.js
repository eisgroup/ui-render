"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNilValues = exports.interpolateString = exports.toList = exports.isList = exports.isString = exports.isObject = exports.isFunction = exports.isCollection = void 0;
var lodash_1 = require("lodash");
var lodash_2 = require("lodash");
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return lodash_2.get; } });
Object.defineProperty(exports, "isPlainObject", { enumerable: true, get: function () { return lodash_2.isPlainObject; } });
Object.defineProperty(exports, "cloneDeep", { enumerable: true, get: function () { return lodash_2.cloneDeep; } });
/**
 * Check if the data passed is an array or plain object.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
function isCollection(data) {
    return (!!data && (data.constructor === Array || lodash_1.isPlainObject(data)));
}
exports.isCollection = isCollection;
/**
 * Checks if passed argument is of type function.
 *
 * @param {*} func - the thing we are checking for being a function
 * @return {boolean}
 */
function isFunction(func) {
    // When 'GeneratorFunction' is defined globally, use it instead of isFunction.Generator
    return !!func && (func.constructor === Function ||
        func.constructor === isFunction.Async ||
        func.constructor === isFunction.Generator);
}
exports.isFunction = isFunction;
isFunction.Generator = (function () {
    return __generator(this, function (_a) {
        return [2 /*return*/];
    });
}).constructor;
isFunction.Async = (function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/];
    });
}); }).constructor;
/**
 * Checks if value is the language type of Object
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.4#isPlainObject
 *
 * @param {*} value - any value to check
 * @return {boolean}
 */
function isObject(value) {
    return lodash_1.isPlainObject(value);
}
exports.isObject = isObject;
/**
 * Check if given value is a String
 * @param {*} value - to check
 * @returns {Boolean} true - if it's a string
 */
function isString(value) {
    return typeof value === 'string';
}
exports.isString = isString;
/**
 * Check if the data passed is an array.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
function isList(data) {
    return (!!data && data.constructor === Array);
}
exports.isList = isList;
/**
 * Converts Any Value to Array (or keep it as is if already Array)
 *
 * @param {*} value - the value to convert
 * @param {*} [clean] - if truthy, remove falsey values: false, null, 0, "", undefined, and NaN
 * @return {Array}
 */
function toList(value, clean) {
    if (!isList(value))
        value = [value];
    return clean ? value.filter(function (v) { return v; }) : value;
}
exports.toList = toList;
/**
 * Interpolate a Template String with given Variables
 * @example:
 *    interpolateString('key.{id}.name', {id: 'user'})
 *    >>> 'key.user.name'
 *
 *    interpolateString('key.{state.id}.name', {state: {id: 'user'}})
 *    >>> 'key.user.name'
 *
 *    interpolateString('key.{state.id,0}.name', {})
 *    >>> 'key.0.name'
 *
 *    interpolateString('key.{id}.name', {$id: 'user'}, {formatKey: '$key'})
 *    >>> 'key.user.name'
 *
 * @param {String} string - template with '{placeholders}' to interpolate
 * @param {Object} variables - object containing keys matching the names of placeholders to interpolate
 * @param {String} [formatKey] - key format to match in given 'variables' (e.g. format = '$key')
 * @param {String} [name] - function name to use in case error is thrown
 * @param {Boolean} [suppressError] - whether to ignore error when replacement string not found, and leave as is
 * @return {String} output - with interpolated variables
 */
function interpolateString(string, variables, _a) {
    if (variables === void 0) { variables = {}; }
    var _b = _a === void 0 ? {} : _a, formatKey = _b.formatKey, name = _b.name, suppressError = _b.suppressError;
    return string.replace(/{([^{}]+)}/g, function (__, match) {
        var key = match;
        if (formatKey)
            key = formatKey.replace('key', key);
        // noinspection JSCheckFunctionSignatures
        // @ts-ignore
        var result = lodash_1.get.apply(void 0, __spreadArrays([variables], key.split(',')));
        if (result === undefined) {
            if (!suppressError) {
                throw new Error((name || interpolateString.name + '()') + " expects variable '" + key + "', got '" + variables[key] + "'");
            }
            return "{" + match + "}";
        }
        return result;
    });
}
exports.interpolateString = interpolateString;
/**
 * Remove Null/Undefined value keys from given Collection by mutation
 * (For Array, falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove nil values
 * @param {Boolean} [recursive] - whether to remove nil values recursively
 * @return {Object|Array} - without null or undefined keys
 */
function removeNilValues(collection, _a) {
    var _b = (_a === void 0 ? {} : _a).recursive, recursive = _b === void 0 ? true : _b;
    for (var key in collection) {
        if (collection[key] == null) {
            delete collection[key];
        }
        else if (recursive && typeof collection[key] === 'object') {
            collection[key] = removeNilValues(collection[key], { recursive: recursive });
        }
    }
    return collection.constructor === Array ? collection.filter(function (v) { return v; }) : collection;
}
exports.removeNilValues = removeNilValues;
