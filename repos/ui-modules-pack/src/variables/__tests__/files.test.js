import { interpolateString } from 'ui-utils-pack'
import { fileName, resolvePath } from '../files'

const id = 'test'
const kind = 'public'
const i = 'thumb'
const ext = 'jpg'
const name = `file.${ext}`
const file = {id, kind, i, ext}
const subFolder = `/ModelName`
const filenameWithoutExt = `Id`
const folder = `${subFolder}/${filenameWithoutExt}`
const filePath = {...file, name, folder}
const workDir = '' // for easier testing

describe(`${fileName.name}()`, () => {
  it(`returns '{id}/{kind}_{i}.{ext}' format`, () => {
    expect(fileName({id, kind, i, name})).toEqual(interpolateString('{id}/{kind}_{i}.{ext}', file))
  })
  it(`returns '{id}/{kind}_{i}' format when 'name' missing`, () => {
    expect(fileName({id, kind, i})).toEqual(interpolateString('{id}/{kind}_{i}', file))
  })
  it(`returns '{id}/{kind}.{ext}' format when 'i' missing`, () => {
    expect(fileName({id, kind, name})).toEqual(interpolateString('{id}/{kind}.{ext}', file))
  })
  it(`returns '{id}/{i}.{ext}' format when 'kind' missing`, () => {
    expect(fileName({id, i, name})).toEqual(interpolateString('{id}/{i}.{ext}', file))
  })
  it(`returns '{id}.{ext}' format when 'kind' and 'i' missing`, () => {
    expect(fileName({id, name})).toEqual(interpolateString('{id}.{ext}', file))
  })
  it(`returns '.{ext}' format when all props missing, except 'name'`, () => {
    expect(fileName({name})).toEqual(interpolateString('.{ext}', file))
  })
  it(`returns '' empty string when all props missing`, () => {
    expect(fileName({})).toEqual('')
  })
  it(`returns '{kind}_{i}.{ext}' format when 'id' missing`, () => {
    expect(fileName({kind, i, name})).toEqual(interpolateString('{kind}_{i}.{ext}', file))
  })
  it(`returns '{id}/{kind}_{i}.{ext}' format with number '0.0', '-0', '+0'`, () => {
    const id = 0.0
    const kind = -0
    const i = +0
    expect(fileName({id, kind, i, name})).toEqual(interpolateString('0/0_0.{ext}', {ext}))
  })
})

describe(`${resolvePath.name}()`, () => {
  it(`returns correct {dir, path, name} when given 'filename' and 'folder'`, () => {
    const payload = {filename: name, folder, workDir}
    const {dir, path, name: _name} = resolvePath(payload)
    expect(dir).toEqual(folder)
    expect(path).toEqual(interpolateString('{folder}/{name}', filePath))
    expect(_name).toEqual(name)
  })
  it(`returns correct {dir, path, name} when given full 'path'`, () => {
    const payload = {path: `${folder}/${name}`}
    const {dir, path, name: _name} = resolvePath(payload)
    expect(dir).toEqual(folder)
    expect(path).toEqual(`${folder}/${name}`)
    expect(_name).toEqual(name)
  })
  it(`converts folder to file '{folder}.{ext}' when 'filename' only has extension`, () => {
    const payload = {filename: `.${ext}`, folder, workDir}
    const {dir, path, name} = resolvePath(payload)
    expect(dir).toEqual(subFolder)
    expect(path).toEqual(interpolateString('{folder}.{ext}', filePath))
    expect(name).toEqual(`${filenameWithoutExt}.${ext}`)
  })
})
