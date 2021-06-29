import {
  classInstanceMethodNames,
  cloneDeep,
  findAllObjsByKeys,
  findObjByKeys,
  GQL_HIDDEN_FIELDS,
  hasObjKeys,
  hasObjMatch,
  objChanges,
  queryString,
  removeDeletedItems,
  removeEmptyValues,
  removeNilValues,
  reset,
  sanitizeGqlResponse,
  sortObjKeys,
  toObjValuesKeyTotal,
  toObjValuesTotal,
  update
} from '../object'

const NON_OBJECT_VALUES = [
  100,
  NaN,
  null,
  undefined,
  'foo',
  '',
  []
]

// Object to Find
const geoJSON = {
  'type': 'Feature',
  'geometry': {
    'type': 'Polygon',
    'coordinates': [[[1, -1], [2, -2], [3, -3]]]
  },
  'properties': {
    'id': 7
  }
}

// Object Collection to Search from
const obj = {
  id: 7,
  items: [
    {
      features: 'polygon',
      geoJSON: {
        'type': 'FeatureCollection',
        'features': [
          geoJSON
        ]
      }
    }
  ]
}

test(`${classInstanceMethodNames.name}() returns instance methods (async/getter/setter), but not static methods or props`, () => {
  class Query {
    propA = 3

    get GetterProp () {
      return this.propA
    }

    set SetterProp (val) {
      this.propsA = val
    }

    static StaticMethod (a, b) {
      return a + b
    }

    static StaticProp = (a, b) => {
      return a + b
    }

    MethodProp = (a, b) => {
      return a + b
    }

    MethodPropAsync = async (a, b) => {
      return new Promise(resolve => resolve(a + b))
    }

    Method (a, b) {
      return a + b
    }

    async AsyncMethod (a, b) {
      return new Promise(resolve => resolve(a + b))
    }
  }

  expect(classInstanceMethodNames(Query)).toEqual(['GetterProp', 'SetterProp', 'Method', 'AsyncMethod'])
})

it(`${hasObjMatch.name}() returns 'true' when nested Collection has a matching Object, else 'false'`, () => {
  const resultTrue = hasObjMatch([[[1, -1], [2, -2]]], [1, -1])
  const resultFalse = hasObjMatch([[[1, -1], [2, -2]]], [1, 1])
  const resultTrueObj = hasObjMatch({items: {bounds: [1, -1]}}, [1, -1])
  const resultFalseObj = hasObjMatch({items: {bounds: [1, -1]}}, [1, 1])
  const resultTrueObjSearch = hasObjMatch({items: {bounds: [1, -1]}}, {bounds: [1, -1]})
  const resultFalseObjSearch = hasObjMatch({items: {bounds: [1, -1]}}, {bounds: [1, 1]})
  expect(resultTrue).toBe(true)
  expect(resultFalse).toBe(false)
  expect(resultTrueObj).toBe(true)
  expect(resultFalseObj).toBe(false)
  expect(resultTrueObjSearch).toBe(true)
  expect(resultFalseObjSearch).toBe(false)
})

it(`${hasObjKeys.name}() returns 'true' when Object has provided key paths and values, else 'false'`, () => {
  const resultTrueInclude = hasObjKeys(geoJSON, {'properties.id': 7, 'geometry.coordinates': [1, -1]}, 'include')
  const resultFalseInclude = hasObjKeys(geoJSON, {'properties.id': 7, 'geometry.coordinates': [1, 1]}, 'include')
  const resultFalseIncludeId = hasObjKeys(geoJSON, {'properties.id': 77, 'geometry.coordinates': [1, -1]}, 'include')
  const resultFalseIncludeId2 = hasObjKeys(geoJSON, {'properties.id': -7, 'geometry.coordinates': [1, -1]}, 'include')
  const resultFalseIncludeId3 = hasObjKeys(geoJSON, {'properties.id': '7', 'geometry.coordinates': [1, -1]}, 'include')
  const resultFalseIncludeId4 = hasObjKeys(geoJSON, {'properties.ids': 7, 'geometry.coordinates': [1, -1]}, 'include')
  const resultTrueShallow = hasObjKeys(geoJSON, {'properties.id': '7'}, 'shallow')
  const resultFalseShallow = hasObjKeys(geoJSON, {'properties.id': '70'}, 'shallow')
  const resultTrueDeep = hasObjKeys(geoJSON, {'properties.id': 7}, 'deep')
  const resultFalseDeep = hasObjKeys(geoJSON, {'properties.id': '7'}, 'deep')
  expect(resultTrueInclude).toBe(true)
  expect(resultFalseInclude).toBe(false)
  expect(resultFalseIncludeId).toBe(false)
  expect(resultFalseIncludeId2).toBe(false)
  expect(resultFalseIncludeId3).toBe(false)
  expect(resultFalseIncludeId4).toBe(false)
  expect(resultTrueShallow).toBe(true)
  expect(resultFalseShallow).toBe(false)
  expect(resultTrueDeep).toBe(true)
  expect(resultFalseDeep).toBe(false)
})

it(`${findObjByKeys.name}() returns matching Object within nested Collection`, () => {
  const resultTrue = findObjByKeys(obj, {'properties.id': 7, 'geometry.coordinates': [1, -1]}, 'include')
  const resultFalse = findObjByKeys(obj, {'properties.id': 7, 'geometry.coordinates': [1, 1]}, 'include')
  const resultFalseId = findObjByKeys(obj, {'properties.id': 77, 'geometry.coordinates': [1, -1]}, 'include')
  expect(resultTrue).toEqual(geoJSON)
  expect(resultFalse).toBe(undefined)
  expect(resultFalseId).toBe(undefined)
})

describe(`${findAllObjsByKeys.name}()`, () => {
  const testObj = {
    obj1: {
      'type': 'Feature',
      'coordinates': [123, 1]
    },
    obj2: {
      'type': 'Feature',
      'coordinates': [123, 2],
      obj22: {
        'type': 'Feature',
        'coordinates': [123, 2]
      }
    },
    obj3: {
      'type': 'Feature',
      'coordinates': [123, 3]
    },
    nestedObj: {
      obj1: {
        'type': 'Feature',
        'coordinates': [123, 4]
      },
      obj2: {
        'type': 'Feature',
        'coordinates': [123, 5]
      },
      obj3: {
        'type': 'Feature',
        'coordinates': [123, 6]
      }
    }
  }

  it('finds all applicable objects, including nested objects.', () => {
    const whereOptions = {'type': 'Feature'}
    const expectedResult = [
      testObj.obj1,
      testObj.obj2, testObj.obj2.obj22,
      testObj.obj3,
      testObj.nestedObj.obj1, testObj.nestedObj.obj2, testObj.nestedObj.obj3
    ]
    expect(findAllObjsByKeys(testObj, whereOptions)).toEqual(expectedResult)
  })

  it('returns empty array when nothing found.', () => {
    const whereOptions = {'type': 'NotFeature'}
    expect(findAllObjsByKeys(testObj, whereOptions)).toEqual([])
  })
})

describe(`${objChanges.name}()`, () => {
  test(`keeps only changed values`, () => {
    expect(objChanges(undefined, undefined)).toEqual(undefined)
    expect(objChanges(undefined, null)).toEqual(undefined)
    expect(objChanges(null, null)).toEqual(undefined)
    expect(objChanges(null, undefined)).toEqual(undefined)
    expect(objChanges({a: 1}, null)).toEqual({a: null})
    expect(objChanges(null, {a: 1})).toEqual({a: 1})
    expect(objChanges({a: 1}, {a: 1, b: 2})).toEqual({b: 2})
  })
  test(`keeps only changed values when nested recursively`, () => {
    expect(objChanges({a: {b: 2}}, {a: {b: 2, c: 3}})).toEqual({a: {c: 3}})
    expect(objChanges({a: {b: 2, c: 3}}, {a: {b: 2}})).toEqual({a: {c: null}})
    expect(objChanges({a: {b: 2, c: 3}}, {a: {b: 2, c: null}})).toEqual({a: {c: null}})
    expect(objChanges({a: {b: 2, c: 3}}, {a: {b: 2, c: Infinity}})).toEqual({a: {c: Infinity}})
  })
  test(`does not mutate given 'original' or 'changed' object`, () => {
    const original = {a: 1, b: {c: 2}}
    const changed = {a: 1, b: {c: 2, d: 3}}
    const result = {b: {d: 3}}
    const originalImmutable = cloneDeep(original)
    const changedImmutable = cloneDeep(changed)
    expect(objChanges(original, changed)).toEqual(result)
    expect(original).toEqual(originalImmutable)
    expect(changed).toEqual(changedImmutable)
  })
})

it(`${reset.name}() sets nested Object recursively by mutation`, () => {
  const state = {user: {name: 'Chris', personality: {level: 10}}}
  const payload = {user: {sign: 'scorpion', personality: {type: 'Cool', element: 'Ether'}}}
  expect(reset(state, payload)).toEqual(payload)
  expect(state).toEqual(payload)
})

it(`${update.name}() adds nested Object recursively by mutation`, () => {
  const state = {user: {name: 'Chris', personality: {level: 10}}}
  const payload = {user: {name: undefined, sign: 'scorpion', personality: {type: 'Cool', element: 'Ether'}}}
  const expected = {user: {name: undefined, sign: 'scorpion', personality: {level: 10, type: 'Cool', element: 'Ether'}}}
  expect(update(state, payload)).toEqual(expected)
  expect(state).toEqual(expected)
})

it(`${removeNilValues.name}() deletes all Null/Undefined value keys from Collection (Falsey values from List)`, () => {
  const object = {
    id: 7,
    name: null,
    age: undefined,
    address: {
      street: null,
      city: undefined,
      planet: 'Earth'
    }
  }
  const expectedDefault = {
    id: 7,
    address: {
      street: null,
      city: undefined,
      planet: 'Earth'
    }
  }
  const expectedRecursive = {
    id: 7,
    address: {
      planet: 'Earth'
    }
  }
  const list = [null, undefined, false, NaN, 0, '', 7, {person: [null, 'God']}]
  const expectedList = [7, {person: ['God']}]
  expect(removeNilValues(cloneDeep(object), {recursive: false})).toEqual(expectedDefault)
  expect(removeNilValues(cloneDeep(object))).toEqual(expectedRecursive)
  expect(removeNilValues(list)).toEqual(expectedList)
})

it(`${removeEmptyValues.name}() deletes all Empty string value keys from Collection (Falsey values from List)`, () => {
  const object = {
    id: 7,
    name: '',
    address: {
      street: '',
      city: undefined,
      planet: 'Earth'
    }
  }
  const expectedDefault = {
    id: 7,
    address: {
      street: '',
      city: undefined,
      planet: 'Earth'
    }
  }
  const expectedRecursive = {
    id: 7,
    address: {
      city: undefined,
      planet: 'Earth'
    }
  }
  const list = [null, undefined, false, NaN, 0, '', 7, {person: [null, 'God']}]
  const expectedList = [7, {person: ['God']}]
  expect(removeEmptyValues(cloneDeep(object), {recursive: false})).toEqual(expectedDefault)
  expect(removeEmptyValues(cloneDeep(object))).toEqual(expectedRecursive)
  expect(removeEmptyValues(list)).toEqual(expectedList)
})

it(`${removeDeletedItems.name}() deletes all objects with truthy 'delete' property`, () => {
  const object = {
    isActive: null,
    currencies: {
      ETH: {
        currency: 'ETH',
        delete: true
      }
    },
    exchanges: {
      WEX: {
        exchange: 'WEX',
        currencies: {
          ETH: {
            currency: 'ETH',
            delete: true
          }
        }
      },
      EXX: {
        exchange: 'EXX',
        delete: true
      }
    }
  }
  const expected = {
    isActive: null,
    currencies: {},
    exchanges: {
      WEX: {
        exchange: 'WEX',
        currencies: {}
      }
    }
  }
  const list = [7, {delete: 'yes', id: 7}, {person: {id: 'God', delete: true}}]
  const expectedList = [7, {}]
  expect(removeDeletedItems(object)).toEqual(expected)
  expect(removeDeletedItems(list)).toEqual(expectedList)
})

it(`${sanitizeGqlResponse.name}() deletes all GraphQL tags, Null/Undefined values from Collection (Falsey values from List)`, () => {
  const hiddenFields = {}
  GQL_HIDDEN_FIELDS.forEach(name => hiddenFields[name] = true)
  const object = {
    ...hiddenFields,
    name: null,
    age: undefined,
    beliefs: [null, undefined, false, NaN, 0, '', 7, {person: [null, 'God']}],
    address: {
      street: null,
      city: undefined,
      planet: 'Earth',
      __typename: 'Address'
    },
    __typename: 'Profile'
  }
  const expected = {
    beliefs: [7, {person: ['God']}],
    address: {
      planet: 'Earth'
    }
  }
  expect(sanitizeGqlResponse(object, {tags: GQL_HIDDEN_FIELDS})).toEqual(expected)
})

it(`${sortObjKeys.name}() returns new Object with Keys in given sort order`, () => {
  const payload = {b: 2, ab: 1, c: 3, a: 0}
  const expected = queryString({a: 0, ab: 1, b: 2, c: 3})
  const expectedReverse = queryString({c: 3, b: 2, ab: 1, a: 0})
  expect(queryString(sortObjKeys(payload))).toEqual(expected)
  expect(queryString(sortObjKeys(payload, 'asc'))).toEqual(expected)
  expect(queryString(sortObjKeys(payload, 'desc'))).toEqual(expectedReverse)
})

it(`${toObjValuesTotal.name}() computes correct total number of values provided`, () => {
  expect(toObjValuesTotal({'a': 0, 'b': 1, 'c': 2})).toEqual(3)
  expect(toObjValuesTotal(undefined)).toEqual(0)
  expect(toObjValuesTotal(null)).toEqual(0)
  expect(toObjValuesTotal(NaN)).toEqual(0)
  expect(toObjValuesTotal({})).toEqual(0)
  expect(toObjValuesTotal([])).toEqual(0)
  expect(toObjValuesTotal('')).toEqual(0)
})

it(`${toObjValuesKeyTotal.name}() computes correct total number of values provided`, () => {
  expect(toObjValuesKeyTotal({'a': {'count': 0}, 'b': {'count': 1}, 'c': {'count': 2}}, 'count')).toEqual(3)
  expect(toObjValuesKeyTotal(undefined)).toEqual(0)
  expect(toObjValuesKeyTotal(null)).toEqual(0)
  expect(toObjValuesKeyTotal(NaN)).toEqual(0)
  expect(toObjValuesKeyTotal({})).toEqual(0)
  expect(toObjValuesKeyTotal([])).toEqual(0)
  expect(toObjValuesKeyTotal('')).toEqual(0)
})

describe(`${queryString.name}()`, () => {
  it('converts object into query string', () => {
    const obj = {
      query: 'God',
      ids: [1, 2],
      limit: 7
    }
    expect(queryString(obj)).toEqual('query=God&ids=1&ids=2&limit=7')
  })

  it('returns empty string for non-object values', () => {
    NON_OBJECT_VALUES.forEach(value => expect(queryString(value)).toEqual(''))
  })

  // it('converts object into query string, trimmed to last parameter before 2000 character limit', () => {
  //   const obj = {
  //     // Make this key exactly 100 characters long
  //     '----------------------------------------------------------------------------------------------------': [
  //       1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, '19', 20, 21, 22
  //     ]
  //   }
  //   const result = toParams(obj)
  //   const lastParamValue = result.match(/.*=(.*?)$/).pop()
  //   expect(result.length).toBeLessThan(2000)
  //   expect(lastParamValue).toEqual('19')
  // })
})
