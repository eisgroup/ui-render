import { toText } from '../codec'

describe(`${toText.name}()`, () => {
  it('converts nested object correctly', () => {
    expect(toText({a: 3, b: 4, c: {a: 9}, d: null, ar: [1, 3, 5]}))
      .toEqual(`{a:3,b:4,c:{a:9},d:null,ar:[1,3,5]}`)
  })
})
