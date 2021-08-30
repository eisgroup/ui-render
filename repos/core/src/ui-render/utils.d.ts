export { get, isPlainObject, cloneDeep } from 'lodash';
/**
 * Check if the data passed is an array or plain object.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
export declare function isCollection(data: any): boolean;
/**
 * Checks if passed argument is of type function.
 *
 * @param {*} func - the thing we are checking for being a function
 * @return {boolean}
 */
export declare function isFunction(func: any): boolean;
export declare namespace isFunction {
    var Generator: Function;
    var Async: Function;
}
/**
 * Checks if value is the language type of Object
 *
 * @uses lodash
 * @see https://lodash.com/docs/4.17.4#isPlainObject
 *
 * @param {*} value - any value to check
 * @return {boolean}
 */
export declare function isObject(value: any): boolean;
/**
 * Check if given value is a String
 * @param {*} value - to check
 * @returns {Boolean} true - if it's a string
 */
export declare function isString(value: any): boolean;
/**
 * Check if the data passed is an array.
 *
 * @param {*} data - The variable to check
 * @return {boolean}
 */
export declare function isList(data: any): boolean;
/**
 * Converts Any Value to Array (or keep it as is if already Array)
 *
 * @param {*} value - the value to convert
 * @param {*} [clean] - if truthy, remove falsey values: false, null, 0, "", undefined, and NaN
 * @return {Array}
 */
export declare function toList(value: any, clean: boolean): any;
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
export declare function interpolateString(string: string, variables?: any, { formatKey, name, suppressError }?: any): string;
/**
 * Remove Null/Undefined value keys from given Collection by mutation
 * (For Array, falsey values will be removed)
 *
 * @param {Object|Array} collection - to remove nil values
 * @param {Boolean} [recursive] - whether to remove nil values recursively
 * @return {Object|Array} - without null or undefined keys
 */
export declare function removeNilValues(collection: any, { recursive }?: {
    recursive?: boolean | undefined;
}): any;
