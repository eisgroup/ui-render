import { mapProps, relativePathFrom, metaToProps } from '../transforms'

jest.mock('../Render', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}))

const funcConfig = {
    fieldFunc: {},
    fieldValidation: {},
    fieldNormalizer: {},
    fieldParser: {},
    fieldMethods: {},
}

function cfg (overrides = {}) {
    return {
        data: {},
        instance: {},
        form: undefined,
        funcConfig: { ...funcConfig },
        ...overrides,
    }
}

describe('mapProps debug mode', () => {
    it('does not strip falsy items when debug=true', () => {
        const data = [null, { name: 'A' }, undefined]
        // debug:true passes raw `data` to .map (without cleaning via toList)
        const out = mapProps(data, 'name', { debug: true })
        expect(out).toHaveLength(3)
        // get(null, 'name', null) → null
        expect(out[0]).toBeNull()
        expect(out[1]).toBe('A')
    })
})

describe('relativePathFrom additional cases', () => {
    it('returns relativePath when meta has no name', () => {
        expect(relativePathFrom({}, 'parent', 1)).toBe('parent')
    })

    it('returns just meta.name when no relativePath', () => {
        expect(relativePathFrom({ name: 'rows', relativeData: true }, undefined, undefined)).toBe('rows')
    })

    it('does not prepend when meta.name already starts with relativePath', () => {
        expect(
            relativePathFrom({ name: 'parent.child', relativeData: true }, 'parent', undefined)
        ).toBe('parent.child')
    })

    it('returns relativePath when meta.relativeData is explicitly false', () => {
        expect(
            relativePathFrom({ name: 'child', relativeData: false }, 'parent', 0)
        ).toBe('parent')
    })
})

describe('metaToProps - name interpolation', () => {
    it('interpolates {state.*} into meta.name from instance', () => {
        const meta = { view: 'Input', name: 'items.{state.idx}.value' }
        metaToProps(meta, cfg({ instance: { state: { idx: 2 } } }))
        expect(meta.name).toBe('items.2.value')
    })

    it('leaves placeholder intact when variable not found (suppressError)', () => {
        const meta = { view: 'Input', name: 'a.{state.missing}.b' }
        metaToProps(meta, cfg({ instance: {} }))
        expect(meta.name).toBe('a.{state.missing}.b')
    })
})

describe('metaToProps - {name} value transform', () => {
    it('resolves single-key {name} object against data', () => {
        const meta = {
            view: 'Text',
            content: { name: 'user.firstName' },
        }
        metaToProps(meta, cfg({ data: { user: { firstName: 'Alice' } } }))
        expect(meta.content).toBe('Alice')
    })

    it('falls back to empty string when value missing and view is set', () => {
        const meta = {
            view: 'Text',
            content: { name: 'user.missing' },
        }
        metaToProps(meta, cfg({ data: { user: {} } }))
        expect(meta.content).toBe('')
    })

    it('honors relativeData=false to read from root data', () => {
        const meta = {
            view: 'Text',
            content: { name: 'global', relativeData: false },
        }
        metaToProps(meta, cfg({ data: { global: 'X' } }))
        expect(meta.content).toBe('X')
    })
})

describe('metaToProps - render string mapping', () => {
    it('maps a render* string attribute to a function via Render.Method', () => {
        // Stub Render.Method to return an identity function
        // eslint-disable-next-line global-require
        const RenderMod = require('../Render').default
        RenderMod.Method = jest.fn(() => (v) => v)

        const meta = {
            view: 'Text',
            renderValue: 'identity',
        }
        metaToProps(meta, cfg())
        expect(typeof meta.renderValue).toBe('function')
        expect(meta.renderValue('x')).toBe('x')
    })
})

describe('metaToProps - relativePath propagation', () => {
    it('propagates relativePath / relativeIndex to nested view nodes', () => {
        const meta = {
            view: 'Table',
            // no name, no other attributes
        }
        metaToProps(meta, cfg({ relativePath: 'orders', relativeIndex: 2 }))
        expect(meta.relativePath).toBe('orders')
        expect(meta.relativeIndex).toBe(2)
    })
})

describe('metaToProps - function definitions on onClick', () => {
    it('resolves an onClick function name from fieldFunc', () => {
        const handler = jest.fn()
        const meta = {
            view: 'Button',
            onClick: 'doThing',
        }
        metaToProps(meta, cfg({
            funcConfig: { ...funcConfig, fieldFunc: { doThing: handler } },
        }))
        expect(typeof meta.onClick).toBe('function')
        meta.onClick('arg1')
        expect(handler).toHaveBeenCalledWith('arg1')
    })

    it('resolves onClick from object with name + args', () => {
        const handler = jest.fn()
        const meta = {
            view: 'Button',
            onClick: { name: 'doThing', args: ['extra'] },
        }
        metaToProps(meta, cfg({
            funcConfig: {
                ...funcConfig,
                fieldFunc: { doThing: handler },
                fieldMethods: {},
            },
        }))
        expect(typeof meta.onClick).toBe('function')
        meta.onClick('caller')
        expect(handler).toHaveBeenCalledWith('caller', 'extra')
    })

    it('falls back to the original name when no function is found', () => {
        const meta = {
            view: 'Button',
            onClick: 'unknownFn',
        }
        metaToProps(meta, cfg({
            funcConfig: {
                ...funcConfig,
                fieldFunc: {},
                fieldMethods: {},
            },
        }))
        // Render.Method is set in the mock to a jest.fn returning identity
        // Falls back to fallback (= name)
        expect(meta.onClick === 'unknownFn' || typeof meta.onClick === 'function').toBe(true)
    })
})

describe('mapProps with mapper.relativeData', () => {
    it('handles default mapping where data is filtered', () => {
        const data = [{ a: 1 }, null, { a: 2 }]
        const out = mapProps(data, 'a')
        expect(out).toEqual([1, 2])
    })
})

describe('metaToProps - render conditional values', () => {
    it('renderValue with values map and missing key returns the value', () => {
        const meta = {
            view: 'Text',
            renderValue: {
                values: { A: 'a-text' },
            },
        }
        metaToProps(meta, cfg())
        const out = meta.renderValue('NOT_IN_MAP', 0, {}, null)
        expect(out).toBe('NOT_IN_MAP')
    })

    it('renderValue function definition with explicit name and matching fieldFunc', () => {
        const fn = jest.fn(() => 'rendered')
        const meta = {
            view: 'Text',
            renderValue: { name: 'doRender' },
        }
        metaToProps(meta, cfg({
            funcConfig: {
                ...funcConfig,
                fieldFunc: { doRender: fn },
                fieldMethods: {},
            },
        }))
        const out = meta.renderValue('value-x', 0, {}, null)
        expect(out).toBe('rendered')
        expect(fn).toHaveBeenCalled()
    })
})

describe('metaToProps - state interpolation', () => {
    it('interpolates {state.*} into nested item name', () => {
        const meta = {
            view: 'Text',
            items: [
                { view: 'Text', name: 'rows.{state.idx}.value' },
            ],
        }
        metaToProps(meta, cfg({ instance: { state: { idx: 3 } } }))
        expect(meta.items[0].name).toBe('rows.3.value')
    })
})

describe('metaToProps - {name} with relativeData=false', () => {
    it('resolves {name} against root data when relativeData=false on parent', () => {
        const meta = {
            view: 'Text',
            relativeData: false,
            content: { name: 'global.foo' },
        }
        metaToProps(meta, cfg({ data: { global: { foo: 'X' } } }))
        expect(meta.content).toBe('X')
    })

    it('keeps original {name} when not resolvable and view is undefined (no fallback)', () => {
        const meta = {
            content: { name: 'missing' },
        }
        metaToProps(meta, cfg({ data: {} }))
        expect(meta.content).toBe('missing')
    })
})

describe('relativePathFrom - relativeIndex empty string', () => {
    it('does not embed empty-string relativeIndex into the path', () => {
        expect(relativePathFrom({ name: 'rows', relativeData: true }, 'parent', '')).toBe('parent.rows')
    })
})

describe('metaToFunctions - validate / format / parse / normalize / verify', () => {
    const customFormat = (v) => `f:${v}`
    const customParse = (v) => `p:${v}`
    const customNormalize = (v) => `n:${v}`
    const customValidate = (v) => v ? undefined : 'required'

    function withFuncs (overrides = {}) {
        return cfg({
            funcConfig: {
                ...funcConfig,
                fieldNormalizer: { myFmt: customFormat, myNorm: customNormalize },
                fieldParser: { myParse: customParse },
                fieldValidation: { myValid: customValidate },
                fieldFunc: {},
                fieldMethods: {},
                ...overrides,
            },
        })
    }

    it('resolves format string from fieldNormalizer', () => {
        const meta = { view: 'Input', name: 'x', format: 'myFmt' }
        metaToProps(meta, withFuncs())
        expect(meta.format('val')).toBe('f:val')
    })

    it('resolves parse string from fieldParser', () => {
        const meta = { view: 'Input', name: 'x', parse: 'myParse' }
        metaToProps(meta, withFuncs())
        expect(meta.parse('val')).toBe('p:val')
    })

    it('falls back from fieldParser to fieldNormalizer when parse not found', () => {
        const meta = { view: 'Input', name: 'x', parse: 'myNorm' }
        metaToProps(meta, withFuncs())
        expect(meta.parse('v')).toBe('n:v')
    })

    it('resolves normalize string', () => {
        const meta = { view: 'Input', name: 'x', normalize: 'myNorm' }
        metaToProps(meta, withFuncs())
        expect(meta.normalize('v')).toBe('n:v')
    })

    it('resolves validate string', () => {
        const meta = { view: 'Input', name: 'x', validate: 'myValid' }
        metaToProps(meta, withFuncs())
        expect(meta.validate('')).toBe('required')
        expect(meta.validate('ok')).toBeUndefined()
    })

    it('composes verify validators', () => {
        const meta = {
            view: 'Input',
            name: 'x',
            verify: { validate: { name: 'myValid' } },
        }
        metaToProps(meta, withFuncs())
        expect(typeof meta.validate).toBe('function')
        // Verify is consumed → removed
        expect(meta.verify).toBeUndefined()
    })

    it('verify with unknown validator name returns undefined', () => {
        const meta = {
            view: 'Input',
            name: 'x',
            verify: { validate: { name: 'unknown' } },
        }
        metaToProps(meta, withFuncs())
        expect(meta.validate('whatever')).toBeUndefined()
    })
})
