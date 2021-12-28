/**
 * @jest-environment node
 */
import { Id, Localised, required } from '../types'

describe(`${Localised.name}()`, () => {
  it(`returns nested type definitions for Mongoose`, () => {
    const maxLength = 150
    const schema = {
      _id: Id,
      ...Localised({
        about: String,
        name: {maxLength},
      })
    }
    const result = {
      _id: Id,
      _: {
        _id: false,
        about: {
          _id: false,
          en: String,
        },
        name: {
          _id: false,
          en: {type: String, maxLength},
        }
      },
    }
    expect(schema).toEqual(result)
  })
  it(`returns nested type definitions for Mongoose with 'required' attribute`, () => {
    const maxLength = 150
    const schema = {
      _id: Id,
      ...Localised({
        about: String,
        name: {maxLength, required},
      })
    }
    const result = {
      _id: Id,
      _: {
        type: {
          _id: false,
          about: {
            _id: false,
            en: String,
          },
          name: {
            type: {
              _id: false,
              en: {type: String, maxLength},
            },
            required,
          }
        },
        required,
      },
    }
    expect(schema).toEqual(result)
  })
  it(`returns nested type definitions for Mongoose with 'required' in simple form`, () => {
    const maxLength = 150
    const schema = {
      _id: Id,
      ...Localised({
        about: String,
        name: {required},
      })
    }
    const result = {
      _id: Id,
      _: {
        type: {
          _id: false,
          about: {
            _id: false,
            en: String,
          },
          name: {
            type: {
              _id: false,
              en: String,
            },
            required,
          }
        },
        required,
      },
    }
    expect(schema).toEqual(result)
  })
})
