import { metaToProps } from '../transforms'

jest.mock('../Render', () => ({
    __esModule: true,
    default: jest.fn(),
}))

// eslint-disable-next-line import/first
import Render from '../Render'

const emptyFunctionConfig = {
    fieldFunc: {},
    fieldValidation: {},
    fieldNormalizer: {},
    fieldParser: {},
    fieldMethods: {},
}

function config (overrides = {}) {
    return {
        data: {},
        instance: {},
        form: undefined,
        funcConfig: { ...emptyFunctionConfig },
        ...overrides,
    }
}

function withFieldFunctions (fieldFunc, overrides = {}) {
    return config({
        ...overrides,
        funcConfig: {
            ...emptyFunctionConfig,
            fieldFunc,
        },
    })
}

describe('metaToProps nested render contracts', () => {
    beforeEach(() => {
        Render.mockReset()
        Render.mockReturnValue('rendered-node')
        Render.Method = jest.fn(() => null)
    })

    it('derives a nested table renderCell path from the table instance', () => {
        const meta = {
            view: 'Table',
            headers: [
                {
                    id: 'amount',
                    renderCell: {
                        view: 'Input',
                        name: 'amount',
                    },
                },
            ],
        }

        metaToProps(meta, config({
            relativePath: 'orders',
            relativeIndex: 2,
        }))
        const self = {
            props: {
                view: 'Table',
                name: 'lineItems',
                relativeData: true,
            },
        }

        expect(meta.headers[0].renderCell(10, 2, { className: 'money' }, self))
            .toBe('rendered-node')
        expect(Render).toHaveBeenCalledWith(expect.objectContaining({
            view: 'Input',
            name: 'amount',
            relativeIndex: 2,
            relativePath: 'orders.2.lineItems',
        }), 2)
    })

    it('renders a view selected by a values definition', () => {
        const meta = {
            view: 'Text',
            renderValue: {
                values: {
                    blocked: {
                        view: 'Badge',
                        children: 'Blocked',
                    },
                },
            },
        }
        const data = { status: 'blocked' }

        metaToProps(meta, config({ data }))

        expect(meta.renderValue('blocked', 3, { className: 'status' }))
            .toBe('rendered-node')
        expect(Render).toHaveBeenCalledWith(expect.objectContaining({
            view: 'Badge',
            children: 'Blocked',
            className: 'status',
            data,
        }), 3)
    })

    it('runs a function selected by a values definition', () => {
        const formatStatus = jest.fn((value, index, props, suffix) => (
            `${value}:${index}:${props.kind}:${suffix}`
        ))
        const meta = {
            view: 'Text',
            renderValue: {
                values: {
                    ready: {
                        name: 'formatStatus',
                        args: ['ok'],
                    },
                },
            },
        }

        metaToProps(meta, withFieldFunctions({ formatStatus }))

        expect(meta.renderValue('ready', 4, { kind: 'state' }))
            .toBe('ready:4:state:ok')
        expect(formatStatus).toHaveBeenCalledTimes(1)
    })

    it('uses a named render method selected as the default value definition', () => {
        Render.Method = jest.fn(name => value => `${name}:${value}`)
        const meta = {
            view: 'Text',
            renderValue: {
                values: {},
                default: 'renderFallback',
            },
        }

        metaToProps(meta, config())

        expect(meta.renderValue('unknown', 0, {})).toBe('renderFallback:unknown')
        expect(Render.Method).toHaveBeenCalledWith('renderFallback')
    })

    it('returns the unresolved renderer name instead of invoking a non-function', () => {
        const meta = {
            view: 'Text',
            renderValue: { name: 'missingRenderer' },
        }

        metaToProps(meta, config())

        expect(meta.renderValue('value', 0, {})).toBe('missingRenderer')
    })

    it('treats an empty render definition as a safe no-op', () => {
        const meta = {
            view: 'Text',
            renderValue: {},
        }

        metaToProps(meta, config())

        expect(meta.renderValue('value', 0, {})).toBeUndefined()
        expect(Render).not.toHaveBeenCalled()
        expect(Render.Method).not.toHaveBeenCalled()
    })

    it('allows a non-string name binding to carry a literal value', () => {
        const meta = {
            view: 'Text',
            children: { name: 0 },
        }

        metaToProps(meta, config({ data: { ignored: true } }))

        expect(meta.children).toBe(0)
    })
})

describe('metaToProps action definition contracts', () => {
    beforeEach(() => {
        Render.mockReset()
        Render.Method = jest.fn(() => null)
    })

    it('interpolates configured action args from the row index and row value', () => {
        const saveRow = jest.fn(() => 'saved')
        const meta = [
            {
                view: 'Button',
                onClick: {
                    name: 'saveRow',
                    args: ['rows.{index}.{value.id}', 42],
                },
            },
        ]

        metaToProps(meta, withFieldFunctions({ saveRow }, {
            relativeIndex: 3,
            _data: { id: 'A-17' },
        }))

        expect(meta[0].onClick('event')).toBe('saved')
        expect(saveRow).toHaveBeenCalledWith('event', 'rows.3.A-17', 42)
    })

    it('preserves a falsey row value while interpolating action args', () => {
        const saveRow = jest.fn()
        const meta = [
            {
                view: 'Button',
                onClick: {
                    name: 'saveRow',
                    args: ['rows.{index}.{value}'],
                },
            },
        ]

        metaToProps(meta, withFieldFunctions({ saveRow }, {
            relativeIndex: 0,
            _data: 0,
        }))
        meta[0].onClick()

        expect(saveRow).toHaveBeenCalledWith('rows.0.0')
    })

    it('merges popup row context into an existing options argument', () => {
        const popupOpen = jest.fn()
        const meta = [
            {
                view: 'Button',
                onClick: {
                    name: 'popupOpen',
                    args: ['details', { mode: 'edit' }],
                },
            },
        ]

        metaToProps(meta, withFieldFunctions({ popupOpen }, {
            relativePath: 'orders.2.lineItems',
            relativeIndex: 5,
        }))
        meta[0].onClick()

        // @Note: `relativeIndex` only. Forwarding `relativePath` too would rebind a root-level popup
        // template onto the table's path, because it outranks every other source in `rules.tsx`.
        expect(popupOpen).toHaveBeenCalledWith('details', {
            mode: 'edit',
            relativeIndex: 5,
        })
    })

    it('appends popup row context when no options argument exists', () => {
        const popupOpen = jest.fn()
        const meta = [
            {
                view: 'Button',
                onClick: {
                    name: 'popupOpen',
                    args: ['details'],
                },
            },
        ]

        metaToProps(meta, withFieldFunctions({ popupOpen }, {
            relativePath: 'orders.2.lineItems',
            relativeIndex: 5,
        }))
        meta[0].onClick()

        expect(popupOpen).toHaveBeenCalledWith('details', {
            relativeIndex: 5,
        })
    })

    it('maps event and data templates before running a synchronous onDone chain', () => {
        const save = jest.fn((...args) => ({ args }))
        const notify = jest.fn((result, channel) => `${channel}:${result.args[0]}`)
        const meta = {
            view: 'Button',
            onClick: {
                name: 'save',
                mapArgs: [
                    '{0.target.value}',
                    '{account.id}',
                    { code: '{1.code}' },
                ],
                args: ['fixed'],
                onDone: {
                    name: 'notify',
                    args: ['toast'],
                },
            },
        }

        metaToProps(meta, withFieldFunctions({ save, notify }, {
            data: { account: { id: 'ACCT-7' } },
        }))

        expect(meta.onClick(
            { target: { value: 'typed' } },
            { code: 'event-code' }
        )).toBe('toast:typed')
        expect(save).toHaveBeenCalledWith(
            'typed',
            'ACCT-7',
            { code: 'event-code' },
            'fixed'
        )
        expect(notify).toHaveBeenCalledWith({
            args: ['typed', 'ACCT-7', { code: 'event-code' }, 'fixed'],
        }, 'toast')
    })

    it('maps a handler\'s argument templates afresh on every call', () => {
        const save = (...args) => args
        const meta = { view: 'Button', onClick: { name: 'save', mapArgs: [{ code: '{1.code}' }, ['{0}']] } }
        metaToProps(meta, withFieldFunctions({ save }))
        // Mapped in place until 2026-10-12, so the second call found the first call's values in the templates.
        expect([meta.onClick('a', { code: 'first' }), meta.onClick('b', { code: 'second' })]).toEqual([
            [{ code: 'first' }, ['a']],
            [{ code: 'second' }, ['b']],
        ])
    })

    it('awaits an asynchronous action before invoking onDone', async () => {
        const load = jest.fn(() => Promise.resolve('payload'))
        const finishedValues = []
        function finish (value) {
            finishedValues.push(value)
            return `done:${value}`
        }
        const action = {
            name: 'load',
            onDone: 'finish',
        }
        const meta = {
            view: 'Button',
            onClick: action,
        }

        metaToProps(meta, withFieldFunctions({ load, finish }))

        expect(action.onDone).toBe(finish)
        const result = await meta.onClick()
        expect(finishedValues).toEqual(['payload'])
        expect(result).toBe('done:payload')
    })

    it('maps string and literal arguments for an action without an onDone callback', () => {
        const select = jest.fn((rank, value) => `selected:${rank}:${value}`)
        const meta = {
            view: 'Button',
            onClick: {
                name: 'select',
                mapArgs: [7, '{0.id}'],
            },
        }

        metaToProps(meta, withFieldFunctions({ select }))

        expect(meta.onClick({ id: 'row-9' })).toBe('selected:7:row-9')
        expect(select).toHaveBeenCalledWith(7, 'row-9')
    })

    it('appends comma-delimited args from a string action definition', () => {
        const navigate = jest.fn(() => 'navigated')
        const meta = {
            view: 'Button',
            onClick: 'navigate,details,edit',
        }

        metaToProps(meta, withFieldFunctions({ navigate }))

        expect(meta.onClick('event')).toBe('navigated')
        expect(navigate).toHaveBeenCalledWith('event', 'details', 'edit')
    })
})

describe('the cells a render* field definition builds, kept per row', () => {
    beforeEach(() => {
        Render.mockReset()
        Render.Method = jest.fn(() => null)
    })

    /** The cell the renderer handed `Render` on its last call. */
    const lastCell = () => Render.mock.calls[Render.mock.calls.length - 1][0]
    const table = (renderCell = { view: 'Input', name: 'note', options: [{ text: 'A', value: 'a' }] }) => {
        const meta = { view: 'Table', renderCell }
        metaToProps(meta, config())
        return meta
    }
    /** Calls the cell renderer as a table does, with a new props object and a new column each time. */
    const callCell = (meta, { value = 'a', index = 0, className = 'cell', self = { props: { name: 'rows' } }, label = 'Note' } = {}) => {
        meta.renderCell(value, index, { className }, self, { label })
        return lastCell()
    }

    it('is the same cell while the row is called with the same things', () => {
        const meta = table()
        const first = callCell(meta)
        expect(callCell(meta)).toBe(first)
    })

    it('is built again for another value, index, props or column label', () => {
        // Each change on a renderer of its own, so that one change does not replace another's cell.
        const kept = change => {
            const meta = table()
            const first = callCell(meta)
            return callCell(meta, change) === first
        }
        expect({
            value: kept({ value: 'b' }),
            index: kept({ index: 1 }),
            props: kept({ className: 'other' }),
            label: kept({ label: 'Other' }),
        }).toEqual({ value: false, index: false, props: false, label: false })
    })

    it('tells the caller\'s props apart by their keys, and from none at all', () => {
        const meta = table()
        const cells = [undefined, { className: 'cell' }, { style: 'cell' }, undefined].map(props => {
            meta.renderCell('a', 0, props, { props: { name: 'rows' } }, { label: 'Note' })
            return lastCell()
        })
        expect(cells.map((cell, i) => i > 0 && cell === cells[i - 1])).toEqual([false, false, false, false])
    })

    it('keeps one cell for each row', () => {
        const meta = table()
        const [first, second] = [callCell(meta, { index: 0 }), callCell(meta, { index: 1 })]
        expect([callCell(meta, { index: 0 }) === first, callCell(meta, { index: 1 }) === second]).toEqual([true, true])
    })

    it('is built again when the caller method standing in for a handler is another', () => {
        const meta = table({ view: 'Button', onClick: 'showRow' })
        const self = { props: { name: 'rows' }, showRow: () => {} }
        const first = callCell(meta, { self })
        self.showRow = () => {}
        const second = callCell(meta, { self })
        expect([second === first, second.onClick === self.showRow]).toEqual([false, true])
    })
})
