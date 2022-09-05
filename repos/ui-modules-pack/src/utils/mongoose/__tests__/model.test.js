/**
 * @jest-environment node
 */
import { foreignKeys } from '../model'
import { ForeignKey, Id, index, Localised, Name, ObjectId, required, Schema, Timestamp, trim } from '../types'

describe(`${foreignKeys.name}()`, () => {
  // Real use case example taken from Job Schema for Events.
  // All tests must run in correct order given.
  const MODEL_NAME = 'User'
  const mostNestedSchema = new Schema({
    id: {type: String, required},
    direct: ForeignKey(MODEL_NAME),
    list: [ForeignKey(MODEL_NAME)],
    listRequired: {type: [ForeignKey(MODEL_NAME)], required},
  })
  const nestedSchema = new Schema({
    deeper: mostNestedSchema,
    deeperRequired: {type: mostNestedSchema, required},
  })
  const nestedSchemaList = new Schema({
    deeper: [mostNestedSchema],
    deeperRequired: {type: [mostNestedSchema], required}
  })
  const baseSchema = {
    _id: Id,
    id: {type: ObjectId, required, index},
    boolean: Boolean,
    booleanList: [Boolean],
    booleanType: {type: Number, required},
    booleanTypeList: {type: [Number], required},
    string: String,
    stringList: [String],
    stringType: {type: String, required},
    stringTypeList: {type: [String], required},
    number: Number,
    numberList: [Number],
    numberType: {type: Number, required},
    numberTypeList: {type: [Number], required},
    ...Localised({
      name: {...Name, trim, required},
    }),
    updated: Timestamp,
  }
  const testCollector = {string: '', schema: {}, finalString: '', finalSchema: {}}
  afterEach(() => {
    testCollector.finalSchema = {...testCollector.finalSchema, ...testCollector.schema}
    testCollector.finalString = (testCollector.finalString + ' ' + testCollector.string).trim()
  })

  it(`extracts direct foreign keys in schema`, () => {
    testCollector.schema = {
      direct: ForeignKey(MODEL_NAME),
      directRequired: ForeignKey(MODEL_NAME, {required}),
    }
    testCollector.string = (
      'direct directRequired'
    )
    const schema = {
      ...baseSchema,
      ...testCollector.schema,
    }
    const result = foreignKeys(schema)
    expect(result.STRING).toEqual(testCollector.string)
    expect(result.length).toEqual(2)
  })

  it(`extracts list foreign keys in schema`, () => {
    testCollector.schema = {
      list: [ForeignKey(MODEL_NAME)],
      listRequired: {type: [ForeignKey(MODEL_NAME)], required, index},
      listRequiredItem: {type: [ForeignKey(MODEL_NAME, {required})], required, index},
    }
    testCollector.string = (
      'list listRequired listRequiredItem'
    )
    const schema = {
      ...baseSchema,
      ...testCollector.schema,
    }
    const result = foreignKeys(schema)
    expect(result.STRING).toEqual(testCollector.string)
    expect(result.length).toEqual(3)
  })

  it(`extracts nested foreign keys in schema`, () => {
    testCollector.schema = {
      nested: {
        direct: ForeignKey(MODEL_NAME),
        list: [ForeignKey(MODEL_NAME)],
        deeper: {
          type: {
            direct: ForeignKey(MODEL_NAME),
            list: [ForeignKey(MODEL_NAME)],
          },
          required,
        }
      },
    }
    testCollector.string = (
      'nested.direct nested.list nested.deeper.direct nested.deeper.list'
    )
    const schema = {
      ...baseSchema,
      ...testCollector.schema,
    }
    const result = foreignKeys(schema)
    expect(result.STRING).toEqual(testCollector.string)
    expect(result.length).toEqual(4)
  })

  it(`extracts nested schema foreign keys in schema`, () => {
    testCollector.schema = {
      nestedSchema,
    }
    testCollector.string = (
      'nestedSchema.deeper.direct nestedSchema.deeper.list nestedSchema.deeper.listRequired ' +
      'nestedSchema.deeperRequired.direct nestedSchema.deeperRequired.list nestedSchema.deeperRequired.listRequired'
    )
    const schema = {
      ...baseSchema,
      ...testCollector.schema,
    }
    const result = foreignKeys(schema)
    expect(result.STRING).toEqual(testCollector.string)
    expect(result.length).toEqual(6)
  })

  it(`extracts nested schema list foreign keys in schema`, () => {
    testCollector.schema = {
      nestedSchemaList,
    }
    testCollector.string = (
      'nestedSchemaList.deeper.direct nestedSchemaList.deeper.list nestedSchemaList.deeper.listRequired ' +
      'nestedSchemaList.deeperRequired.direct nestedSchemaList.deeperRequired.list nestedSchemaList.deeperRequired.listRequired'
    )
    const schema = {
      ...baseSchema,
      ...testCollector.schema,
    }
    const result = foreignKeys(schema)
    expect(result.STRING).toEqual(testCollector.string)
    expect(result.length).toEqual(6)
  })

  it(`works with all use cases above combined`, () => {
    const schema = {
      ...baseSchema,
      ...testCollector.finalSchema,
    }
    const result = foreignKeys(schema)
    expect(result.STRING).toEqual(testCollector.finalString)
    expect(result.length).toEqual(21)
  })
})
