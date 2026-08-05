import {
  changeOptionOrderForSelectFields,
  getFormsData,
  getRawFormsData,
} from '../utils'

const makeForm = values => ({
  getState: () => ({values}),
})

const indexMeta = (mapOptions = {text: 'code', value: '{index}'}) => ({
  view: 'Select',
  name: 'selection',
  mapOptions,
})

describe('Select data reordering integrity contracts', () => {
  it('supports the legacy string mapOptions contract', () => {
    const data = {
      selection: '1',
      options: [{code: 'A'}, {code: 'B'}, {code: 'C'}],
    }

    const result = changeOptionOrderForSelectFields(data, indexMeta('code'))

    expect(result.options.map(option => option.code)).toEqual(['B', 'A', 'C'])
    expect(result).not.toHaveProperty('selection')
  })

  it('recognizes an option field even when the first label is falsey', () => {
    const data = {
      selection: '1',
      options: [{code: ''}, {code: 'B'}],
    }

    const result = changeOptionOrderForSelectFields(data, indexMeta())

    expect(result.options.map(option => option.code)).toEqual(['B', ''])
    expect(result).not.toHaveProperty('selection')
  })

  it.each(['', 'not-a-number', '-1', '1.5', '99', 'Infinity'])(
    'keeps data and the selection intact for an invalid index %p',
    selection => {
      const options = [{code: 'A'}, {code: 'B'}]
      const data = {selection, options}

      const result = changeOptionOrderForSelectFields(data, indexMeta())

      expect(result.options).toEqual([{code: 'A'}, {code: 'B'}])
      expect(result.selection).toBe(selection)
    },
  )

  it('does not reorder a sparse missing option', () => {
    const options = [{code: 'A'}]
    options.length = 2
    const data = {selection: '1', options}

    const result = changeOptionOrderForSelectFields(data, indexMeta())

    expect(result.options).toBe(options)
    expect(result.options[0]).toEqual({code: 'A'})
    expect(1 in result.options).toBe(false)
    expect(result.selection).toBe('1')
  })

  it('keeps a selection when no matching options array exists', () => {
    const data = {
      selection: '1',
      unrelated: [{name: 'A'}, {name: 'B'}],
    }

    const result = changeOptionOrderForSelectFields(data, indexMeta())

    expect(result).toEqual({
      selection: '1',
      unrelated: [{name: 'A'}, {name: 'B'}],
    })
  })

  it('reorders every matching option list whose index is valid', () => {
    const data = {
      selection: '1',
      primary: [{code: 'A'}, {code: 'B'}],
      secondary: [{code: 'X'}, {code: 'Y'}, {code: 'Z'}],
    }

    const result = changeOptionOrderForSelectFields(data, indexMeta())

    expect(result.primary.map(option => option.code)).toEqual(['B', 'A'])
    expect(result.secondary.map(option => option.code)).toEqual(['Y', 'X', 'Z'])
    expect(result).not.toHaveProperty('selection')
  })
})

describe('raw and structured forms data boundaries', () => {
  it('supports entries whose meta is omitted', () => {
    const values = {first: 1, second: 2}
    const forms = new Map([
      ['master', {form: makeForm(values)}],
    ])

    expect(getRawFormsData(forms)).toEqual(values)
    expect(getFormsData(forms)).toEqual(values)
  })

  it('skips a raw relative form whose index is not known', () => {
    const forms = new Map([
      ['master', {form: makeForm({first: 1, second: 2}), meta: {}}],
      ['pending-row', {
        form: makeForm({value: 'draft'}),
        meta: {relativePath: 'rows'},
      }],
    ])

    expect(getRawFormsData(forms)).toEqual({first: 1, second: 2})
  })

  it('places raw sub-form values under a nested relative path', () => {
    const forms = new Map([
      ['master', {
        form: makeForm({root: {rows: [{}, {}]}, version: 1}),
        meta: {},
      }],
      ['nested-row', {
        form: makeForm({value: 'nested'}),
        meta: {relativePath: 'root.rows', relativeIndex: 1},
      }],
    ])

    expect(getRawFormsData(forms)).toEqual({
      root: {rows: [{}, {value: 'nested'}]},
      version: 1,
    })
  })

  it('returns cloned raw data that cannot mutate live form state', () => {
    const values = {
      nested: {count: 1},
      rows: [{value: 'A'}],
    }
    const forms = new Map([
      ['master', {form: makeForm(values), meta: {}}],
    ])

    const result = getRawFormsData(forms)
    result.nested.count = 2
    result.rows[0].value = 'B'

    expect(values).toEqual({
      nested: {count: 1},
      rows: [{value: 'A'}],
    })
  })

  it('reorders a clone for structured output without mutating live form values', () => {
    const values = {
      selection: '1',
      options: [{code: 'A'}, {code: 'B'}],
    }
    const forms = new Map([
      ['master', {form: makeForm(values), meta: indexMeta()}],
    ])

    const result = getFormsData(forms)

    expect(result.options.map(option => option.code)).toEqual(['B', 'A'])
    expect(result).not.toHaveProperty('selection')
    expect(values).toEqual({
      selection: '1',
      options: [{code: 'A'}, {code: 'B'}],
    })
  })
})
