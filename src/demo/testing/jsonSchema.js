/**
 * MINIMAL JSON SCHEMA (draft 2020-12) EVALUATOR — TEST SUPPORT ONLY ===========
 *
 * `meta.schema.json` is a published artifact (UPGRADE-PLAN §9.4), so the test
 * suite has to actually evaluate it against the bundled examples — a schema
 * nothing validates is a schema that silently rots.
 *
 * Why hand-rolled: the project takes no runtime dependencies, and it cannot take
 * a dev one either without an install (`ajv` would be the obvious pick). This
 * file therefore implements exactly the keyword subset `meta.schema.json` uses,
 * and nothing more.
 *
 * The anti-vacuity rule: an evaluator that ignores what it does not understand
 * would pass everything. So `assertSupported()` walks the whole schema first and
 * THROWS on any keyword this file does not implement. Adding a keyword to
 * `meta.schema.json` fails the suite here, loudly, until it is implemented — the
 * schema cannot outgrow its own test.
 *
 * Scope limits, deliberate: `$ref` resolves only local pointers (`#`, and
 * `#/$defs/<name>`); there is no `$dynamicRef`, no remote resolution, no
 * annotation collection, and no format assertion. Errors are reported with the
 * same `items[3].items[0].name` path style the runtime validator uses.
 * -----------------------------------------------------------------------------
 */

/** Keywords this evaluator implements. Anything else in the schema is a hard failure. */
const SUPPORTED_KEYWORDS = [
    // annotations, ignored during evaluation
    '$schema', '$id', 'title', 'description', 'examples', '$comment',
    // structure
    '$defs', '$ref',
    // assertions
    'type', 'enum', 'const', 'pattern', 'minLength', 'required',
    'properties', 'patternProperties', 'additionalProperties', 'items',
    'anyOf', 'allOf',
]

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

const joinPath = (path, key, index) => {
    if (index) return `${path}[${key}]`
    return path ? `${path}.${key}` : String(key)
}

/**
 * Fail loudly on any keyword this evaluator would otherwise silently ignore.
 *
 * @param {Object} schema - schema (or subschema) to audit
 * @param {String} [where] - schema location, for the error message
 * @returns {void}
 * @throws {Error} when an unimplemented keyword is present
 */
export function assertSupported (schema, where = '#') {
    if (typeof schema === 'boolean') return
    if (!isPlainObject(schema)) throw new Error(`${where}: expected a schema object, got ${typeof schema}`)
    Object.keys(schema).forEach(keyword => {
        if (SUPPORTED_KEYWORDS.indexOf(keyword) === -1) {
            throw new Error(
                `${where}: keyword "${keyword}" is not implemented by src/demo/testing/jsonSchema.js. ` +
                'Implement it there (and keep this guard) rather than letting the schema assert something no test checks.'
            )
        }
    })
    const subschemas = ['items', 'additionalProperties']
    subschemas.forEach(keyword => {
        if (keyword in schema) assertSupported(schema[keyword], `${where}/${keyword}`)
    })
    const maps = ['$defs', 'properties', 'patternProperties']
    maps.forEach(keyword => {
        if (keyword in schema) {
            Object.keys(schema[keyword]).forEach(key => assertSupported(schema[keyword][key], `${where}/${keyword}/${key}`))
        }
    })
    const lists = ['anyOf', 'allOf']
    lists.forEach(keyword => {
        if (keyword in schema) {
            schema[keyword].forEach((sub, index) => assertSupported(sub, `${where}/${keyword}/${index}`))
        }
    })
}

/**
 * @param {Object} root - the root schema
 * @param {String} ref - local JSON pointer
 * @returns {Object} resolved subschema
 */
function resolveRef (root, ref) {
    if (ref === '#') return root
    const match = /^#\/\$defs\/([^/]+)$/.exec(ref)
    if (!match) throw new Error(`unsupported $ref "${ref}" — only "#" and "#/$defs/<name>" resolve here`)
    const target = root.$defs && root.$defs[match[1]]
    if (!target) throw new Error(`unresolved $ref "${ref}"`)
    return target
}

/** @returns {Boolean} whether `value` satisfies a single JSON Schema `type` name */
function matchesType (value, name) {
    switch (name) {
        case 'object':
            return isPlainObject(value)
        case 'array':
            return Array.isArray(value)
        case 'string':
            return typeof value === 'string'
        case 'number':
            return typeof value === 'number'
        case 'integer':
            return typeof value === 'number' && Number.isInteger(value)
        case 'boolean':
            return typeof value === 'boolean'
        case 'null':
            return value === null
        default:
            throw new Error(`unsupported type "${name}"`)
    }
}

/**
 * @param {Object|Boolean} schema - subschema to apply
 * @param {*} value - instance value
 * @param {String} path - instance path, for error messages
 * @param {Object} root - root schema, for $ref resolution
 * @param {Array<Object>} errors - accumulator
 * @returns {void}
 */
function apply (schema, value, path, root, errors) {
    if (schema === true || schema === undefined) return
    if (schema === false) {
        errors.push({ path, message: 'value is not allowed here' })
        return
    }

    const fail = (message) => errors.push({ path, message })

    if ('$ref' in schema) apply(resolveRef(root, schema.$ref), value, path, root, errors)

    if ('type' in schema) {
        const names = Array.isArray(schema.type) ? schema.type : [schema.type]
        if (!names.some(name => matchesType(value, name))) {
            fail(`expected type ${names.join(' | ')}, got ${describe(value)}`)
            // Further assertions on a value of the wrong type only produce noise.
            return
        }
    }

    if ('enum' in schema && schema.enum.every(allowed => !sameValue(allowed, value))) {
        fail(`value ${JSON.stringify(value)} is not one of the allowed values`)
    }

    if ('const' in schema && !sameValue(schema.const, value)) {
        fail(`value ${JSON.stringify(value)} must equal ${JSON.stringify(schema.const)}`)
    }

    if ('pattern' in schema && typeof value === 'string' && !new RegExp(schema.pattern).test(value)) {
        fail(`value ${JSON.stringify(value)} does not match pattern ${schema.pattern}`)
    }

    if ('minLength' in schema && typeof value === 'string' && value.length < schema.minLength) {
        fail(`value is shorter than minLength ${schema.minLength}`)
    }

    if ('anyOf' in schema) {
        const branchErrors = schema.anyOf.map(branch => {
            const collected = []
            apply(branch, value, path, root, collected)
            return collected
        })
        if (branchErrors.every(collected => collected.length)) {
            fail(`value matches none of the allowed shapes (${branchErrors
                .map(collected => collected.map(error => error.message).join('; '))
                .join(' | ')})`)
            // A collapsed `anyOf` summary loses the very thing this project wants from the
            // schema: the path of the offending *nested* node. When exactly one branch got past
            // the value's own shape and failed deeper inside it, that branch is the intended one
            // — surface its errors too, so `items[0].items` is reported and not just `items[0]`.
            const deeper = branchErrors.filter(collected => collected.every(error => error.path !== path))
            if (deeper.length === 1) deeper[0].forEach(error => errors.push(error))
        }
    }

    if ('allOf' in schema) {
        schema.allOf.forEach(branch => apply(branch, value, path, root, errors))
    }

    if (isPlainObject(value)) {
        if ('required' in schema) {
            schema.required.forEach(key => {
                if (!Object.prototype.hasOwnProperty.call(value, key)) fail(`missing required property "${key}"`)
            })
        }
        const matched = new Set()
        if ('properties' in schema) {
            Object.keys(value).forEach(key => {
                if (Object.prototype.hasOwnProperty.call(schema.properties, key)) {
                    matched.add(key)
                    apply(schema.properties[key], value[key], joinPath(path, key), root, errors)
                }
            })
        }
        if ('patternProperties' in schema) {
            Object.keys(schema.patternProperties).forEach(pattern => {
                const regex = new RegExp(pattern)
                Object.keys(value).forEach(key => {
                    if (regex.test(key)) {
                        matched.add(key)
                        apply(schema.patternProperties[pattern], value[key], joinPath(path, key), root, errors)
                    }
                })
            })
        }
        if ('additionalProperties' in schema) {
            Object.keys(value).forEach(key => {
                if (!matched.has(key)) apply(schema.additionalProperties, value[key], joinPath(path, key), root, errors)
            })
        }
    }

    if (Array.isArray(value) && 'items' in schema) {
        value.forEach((item, index) => apply(schema.items, item, joinPath(path, index, true), root, errors))
    }
}

/** @returns {String} human readable type of an instance value */
function describe (value) {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
}

/** @returns {Boolean} JSON-equality of two instance values */
function sameValue (a, b) {
    if (a === b) return true
    if (typeof a !== typeof b) return false
    if (a === null || b === null) return false
    if (typeof a !== 'object') return false
    return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Validate an instance against a schema.
 *
 * @param {Object} schema - root schema, already audited by assertSupported()
 * @param {*} instance - value to validate
 * @returns {Array<{path: String, message: String}>} errors - empty when valid
 */
export function validateAgainstSchema (schema, instance) {
    const errors = []
    apply(schema, instance, '', schema, errors)
    return errors
}
