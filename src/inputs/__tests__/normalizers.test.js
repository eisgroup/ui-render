import { date } from '../normalizers'

it(`${date.name}() normalizes date string correctly`, () => {
  expect(date('02.02.2000')).toBe('02.02.2000')
  expect(date('02.02.20002')).toBe('02.02.2000')
  expect(date('02.022.20002')).toBe('02.02.2000')
  expect(date('022.022.20002')).toBe('02.02.2000')
  expect(date('2.2.2000')).toBe('2.2.2000')
  expect(date('2.02.2000')).toBe('2.02.2000')
  expect(date('02.2.2000')).toBe('02.2.2000')
})
