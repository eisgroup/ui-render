import { metaToProps } from '../transforms'

jest.mock('../Render', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}))

// eslint-disable-next-line import/first
import Render from '../Render'

const funcConfig = {
    fieldFunc: {},
    fieldValidation: {},
    fieldNormalizer: {},
    fieldParser: {},
    fieldMethods: {},
}

function baseConfig (overrides = {}) {
    return {
        data: {
            dataKind: {
                experiencePeriods: [{ periodName: 'A' }, { periodName: 'B' }, { periodName: 'C' }],
            },
        },
        instance: {},
        form: undefined,
        funcConfig: { ...funcConfig },
        ...overrides,
    }
}

describe('metaToProps renderExtraItem', () => {
    beforeEach(() => {
        Render.mockClear()
    })

    it('binds the next array slot: relativeIndex = value.length when index arg is undefined', () => {
        const tableMeta = {
            view: 'Table',
            name: 'dataKind.experiencePeriods',
            headers: [{ id: 'periodName' }],
            renderExtraItem: {
                view: 'Data',
                kind: 'experiencePeriods',
                embedded: true,
                meta: {
                    view: 'TableCells',
                    items: [],
                },
            },
        }

        metaToProps(tableMeta, baseConfig())
        expect(typeof tableMeta.renderExtraItem).toBe('function')

        const threeRows = [{ a: 1 }, { a: 2 }, { a: 3 }]
        const self = { props: { name: 'dataKind.experiencePeriods' } }

        tableMeta.renderExtraItem(threeRows, undefined, {}, self)

        expect(Render).toHaveBeenCalled()
        const renderProps = Render.mock.calls[0][0]
        const rowIndexArg = Render.mock.calls[0][1]

        expect(renderProps.relativeIndex).toBe(3)
        expect(rowIndexArg).toBe(3)
    })

    it('does not override an explicit row index when Table passes index', () => {
        const tableMeta = {
            view: 'Table',
            name: 'dataKind.items',
            headers: [{ id: 'x' }],
            renderExtraItem: {
                view: 'Data',
                kind: 'items',
                meta: { view: 'TableCells', items: [] },
            },
        }

        metaToProps(tableMeta, baseConfig())
        tableMeta.renderExtraItem([{ x: 1 }], 0, {}, { props: { name: 'dataKind.items' } })

        const renderProps = Render.mock.calls[0][0]
        expect(renderProps.relativeIndex).toBe(0)
        expect(Render.mock.calls[0][1]).toBe(0)
    })

    it('sets useForm on renderExtraItem definition so nested Data uses a form', () => {
        const tableMeta = {
            view: 'Table',
            name: 'dataKind.experiencePeriods',
            headers: [{ id: 'p' }],
            renderExtraItem: {
                view: 'Data',
                kind: 'experiencePeriods',
                meta: { view: 'TableCells', items: [] },
            },
        }

        metaToProps(tableMeta, baseConfig())
        tableMeta.renderExtraItem([], undefined, {}, { props: { name: 'dataKind.experiencePeriods' } })

        expect(Render.mock.calls[0][0].useForm).toBe(true)
    })
})
