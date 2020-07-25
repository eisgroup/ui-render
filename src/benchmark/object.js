import { bench } from '../log'
import { get, listProps, merge, removeKey, update } from '../object'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

const state = {a: {c: 5}, b: {id: 7, name: 'God'}, c: {id: 111, name: 'light'}}
const obj = {a: {b: {c: {d: {e: {f: 7}}}}}}
const obj2 = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, h: 7, i: 8, j: 9, k: 10, g: 11}
const obj3 = {a: 1, b: 2, c: 3}
const deleteKey = (obj, key) => {
  delete obj[key]
  return obj
}
const getDirectly = (val) => val.a.b.c.d.e.f
const getDestructively = ({a: {b: {c: {d: {e: {f}}}}}}) => f
const listPropsLoop = (obj) => {
  const result = []
  for (const [key, value] of listProps(obj)) {
    result.push({key, value})
  }
  return result
}
const forLoop = (obj) => {
  const result = []
  for (const key in obj) {
    result.push({key, value: obj[key]})
  }
  return result
}
const forKeyInLoop = (obj) => {
  const val = []
  for (const key in obj) {
    val.push(key)
  }
  return val
}
const forKeyInValues = (obj) => {
  const val = []
  for (const key in obj) {
    val.push(obj[key])
  }
  return val
}
const forKeyInValuesLoop = (obj) => {
  const val = {}
  for (const key in obj) {
    const {id, name} = obj[key]
    val[key] = {id, name}
  }
  return val
}
const objectKeys = (obj) => {
  return Object.keys(obj)
}
const objectValues = (obj) => {
  return Object.values(obj)
}
const objectValuesLoop = (obj) => {
  const val = {}
  return Object.values(obj).forEach(({id, name}) => { val[id] = {id, name} })
}
bench({log: '[0]', loop: 1000000}, get, obj, 'a.b.c.d.e.f')
bench({log: '[0]', loop: 1000000}, getDirectly, obj)
bench({log: '[0]', loop: 1000000}, getDestructively, obj)
bench({log: '[0]', loop: 1000}, update, state, obj, 'shouldCloneDeep')
bench({log: '[0]', loop: 1000}, merge, state, obj)
bench({log: '[0].length', loop: 250000}, listPropsLoop, obj2)
bench({log: '[0].length', loop: 250000}, forLoop, obj2)  // x4 times faster than listPropsLoop()
bench({loop: 1000}, forKeyInLoop, state)
bench({loop: 1000}, objectKeys, state)  // x2 times faster than forKeyInLoop()
bench({loop: 1000}, forKeyInValues, state)
bench({loop: 1000}, objectValues, state)  // x2 times faster than forKeyInValues()
bench({loop: 1000}, forKeyInValuesLoop, state)
bench({loop: 1000}, objectValuesLoop, state)  // x2.5 times slower than forKeyInValuesLoop()
bench({log: '[0]', loop: 100000}, deleteKey, {...obj2}, 'c')  // faster
bench({log: '[0]', loop: 100000}, removeKey, obj2, 'c')
bench({log: '[0]', loop: 100000}, deleteKey, {...obj3}, 'c')
bench({log: '[0]', loop: 100000}, removeKey, obj3, 'c')
