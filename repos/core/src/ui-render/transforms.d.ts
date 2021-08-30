/** Configuration used in meta.json for: `mapOptions`, `mapItems`, etc. */
export interface DataMapperOptions {
    /** Raises certain errors if true, defaults to suppress errors */
    debug?: Boolean;
}
/** Configuration for transforming meta.json to React props */
export interface MetaTransformConfig {
    /** Data.json object */
    data: any;
    /** Local data for nested definitions, used if `relativeData` not false */
    _data?: any;
    /** React Component class that is rendering the data, for mapping dynamic states */
    instance: any;
    /** Path used for getting data of parent container */
    relativePath?: string;
    /** Index used for getting data of parent container */
    relativeIndex?: string;
    /** Raises certain errors if true, defaults to suppress errors */
    debug?: Boolean;
    /** FIELD function definitions configuration */
    funcConfig: FunctionTransformConfig;
}
/** Configuration used in meta.json */
export interface FunctionDefinition {
    name: string;
    args?: Array<string>;
    mapArgs?: Array<string>;
    onDone?: FunctionDefinition | Function;
}
interface FunctionTransformConfig {
    /** Data.json object */
    data: any;
    /** FIELD.VALIDATION definitions */
    fieldValidation: any;
    /** FIELD.NORMALIZER definitions */
    fieldNormalizer: any;
    /** FIELD.FUNC definitions */
    fieldFunc: any;
    /** Value to use when function not found, defaults to given `name` string */
    fallback?: any;
    /** List of definitions keys to check for function transform, default is ['onClick', 'onChange', 'onDone'] */
    funcNames?: Array<string>;
}
/**
 * Map Data by given Mapper definition
 *
 * @param {Array|*} data - to map
 * @param {Object|String} mapper - object of key / value pairs (value being key path from `data`), or key path string
 * @param {Boolean} [debug] - whether to raise silenced error if data is missing or of incorrect type
 * @returns {Array} list - mapped from given data
 */
export declare function mapProps(data: Array<object> | any, mapper: object | string | any, { debug }?: DataMapperOptions): any;
/**
 * Recursively map meta.json declarations to props ready for rendering (by mutation)
 * @Note: this function must only transform config, without adding data.
 *  Because data is added at runtime on Render.
 *
 * @param {Object} meta - json
 * @param {*} config
 * @returns {Object} props - mutated meta
 */
export declare function metaToProps(meta: any, config: MetaTransformConfig): any;
export {};
