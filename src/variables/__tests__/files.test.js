import { filePath } from 'modules-pack'
import { interpolateString } from 'utils-pack'

describe(`${filePath.name}()`, () => {
  const id = 'test'
  const kind = 'public'
  const i = 'thumb'
  const ext = 'jpg'
  const file = {id, kind, i, ext}
  it(`returns '{id}/{kind}_{i}.{ext}' format`, () => {
    expect(filePath({id, kind, i, ext})).toEqual(interpolateString('{id}/{kind}_{i}.{ext}', file))
  })
  it(`returns '{id}/{kind}_{i}' format when 'ext' missing`, () => {
    expect(filePath({id, kind, i})).toEqual(interpolateString('{id}/{kind}_{i}', file))
  })
  it(`returns '{id}/{kind}.{ext}' format when 'i' missing`, () => {
    expect(filePath({id, kind, ext})).toEqual(interpolateString('{id}/{kind}.{ext}', file))
  })
  it(`returns '{id}/{i}.{ext}' format when 'kind' missing`, () => {
    expect(filePath({id, i, ext})).toEqual(interpolateString('{id}/{i}.{ext}', file))
  })
  it(`returns '{id}.{ext}' format when 'kind' and 'i' missing`, () => {
    expect(filePath({id, ext})).toEqual(interpolateString('{id}.{ext}', file))
  })
  it(`returns '{kind}_{i}.{ext}' format when 'id' missing`, () => {
    expect(filePath({kind, i, ext})).toEqual(interpolateString('{kind}_{i}.{ext}', file))
  })
  it(`returns '{id}/{kind}_{i}.{ext}' format with number '0.0', '-0', '+0'`, () => {
    const id = 0.0
    const kind = -0
    const i = +0
    expect(filePath({id, kind, i, ext})).toEqual(interpolateString('0/0_0.{ext}', {ext}))
  })
})
