// Loading rules registers the public meta validator in FIELD.VALIDATION.
import '../rules'
import { FIELD } from '../../../modules/variables'

const validate = (...args) => FIELD.VALIDATION.notWithinRange(...args)

function makeInstance ({
    rows,
    formValues,
    relativePath = 'rows',
    relativeIndex = 0,
    kind = 'periods',
    dataKindPath = '',
} = {}) {
    const parent = {
        getDataKind: jest.fn(() => rows || []),
    }

    return {
        dataKindPath,
        formValues,
        props: {
            parent,
            form: { kind },
            meta: {
                relativePath,
                relativeIndex,
            },
        },
    }
}

describe('notWithinRange meta validation', () => {
    const config = {
        dataKind: 'periods',
        args: ['startDate', 'endDate'],
    }

    it('does not validate until both configured field names are present', () => {
        expect(validate('2024-01-01', { dataKind: 'periods' }, {}, {}, {}))
            .toBeUndefined()
        expect(validate('2024-01-01', { args: ['startDate', 'endDate'] }, {}, {}, {}))
            .toBeUndefined()
    })

    it('rejects equal start and end dates in the current row', () => {
        const values = {
            rows: [{
                startDate: '2024-01-10',
                endDate: '2024-01-10',
            }],
        }

        expect(validate(
            '2024-01-10',
            config,
            values,
            { name: 'rows[0].startDate' },
            makeInstance()
        )).toBe('Start date and end date cannot be the same')
    })

    it('reports which boundary is out of order', () => {
        const values = {
            rows: [{
                startDate: '2024-01-20',
                endDate: '2024-01-10',
            }],
        }
        const instance = makeInstance()

        expect(validate(
            '2024-01-20',
            config,
            values,
            { name: 'rows[0].startDate' },
            instance
        )).toBe('Start date cannot be more than end date')

        expect(validate(
            '2024-01-10',
            config,
            values,
            { name: 'rows[0].endDate' },
            instance
        )).toBe('End date cannot be less than start date')
    })

    it('rejects a range overlapping another dataKind row', () => {
        const values = {
            rows: [
                {
                    startDate: '2024-01-10',
                    endDate: '2024-01-20',
                },
                {
                    startDate: '2024-02-01',
                    endDate: '2024-02-10',
                },
            ],
        }
        const instance = makeInstance({
            rows: [
                {
                    startDate: '2024-01-15',
                    endDate: '2024-01-25',
                },
                values.rows[1],
            ],
            relativeIndex: 1,
        })

        expect(validate(
            '2024-02-01',
            config,
            values,
            { name: 'rows[1].startDate' },
            instance
        )).toBeUndefined()

        values.rows[1] = {
            startDate: '2024-01-20',
            endDate: '2024-01-30',
        }

        expect(validate(
            '2024-01-20',
            config,
            values,
            { name: 'rows[1].startDate' },
            instance
        )).toBe('Periods cannot overlap')
        expect(instance.props.parent.getDataKind).toHaveBeenCalledWith('periods', '')
    })

    it('falls back to instance form values and relative row context', () => {
        const formValues = {
            rows: [{
                startDate: '2024-03-10',
                endDate: '2024-03-01',
            }],
        }
        const instance = makeInstance({
            formValues,
            rows: [{
                startDate: '2024-02-01',
                endDate: '2024-02-10',
            }],
        })

        expect(validate(
            '2024-03-10',
            config,
            undefined,
            {},
            instance
        )).toBe('Start date cannot be more than end date')
        expect(instance.props.parent.getDataKind).not.toHaveBeenCalled()
    })

    it('ignores incomplete peer rows', () => {
        const values = {
            rows: [{
                startDate: '2024-04-01',
                endDate: '2024-04-10',
            }],
        }
        const instance = makeInstance({
            rows: [
                null,
                {},
                { startDate: '2024-01-01' },
                { startDate: '', endDate: '' },
            ],
        })

        expect(validate(
            '2024-04-01',
            config,
            values,
            { name: 'rows[0].startDate' },
            instance
        )).toBeUndefined()
    })
})
