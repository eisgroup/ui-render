import {
  by,
  firstBy,
  hasCommonListValue,
  intersection,
  mergeLists,
  shuffle,
  sort,
  toListTotal,
  toUniqueListFast
} from '../array'
import { bench } from '../log'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

const objList = [
  {f: 'Chris', l: 'Cole', user: {id: 1}},
  {f: 'Chris', l: 'Cooper', user: {id: 2}},
  {f: 'Tom', l: 'Cruise', user: {id: 3}},
  {f: 'Nicola', l: 'Tesla', user: {id: 4}},
  {f: 'Mark', l: 'Cooper', user: {id: 5}},
  {f: 'Mark', l: 'Twain', user: {id: 6}}
]
let superLongList = []
for (let i = 0; i < 1000; i++) { superLongList.push(i) }
const longList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22, 33, 44, 55, 66, 77, 88, 99]
const shortList = ['a', 7, 'b', {}, 111, [5, 6, 7], null, NaN, Infinity]
const forLoop = (array) => {
  const result = []
  for (let i = 0; i < array.length; i++) {result.push(array[i])}
  return result
}
const forLoopDecrement = (array) => {
  const result = []
  for (let i = array.length - 1; i > -1; i--) {result.push(array[i])}
  return result
}
const forOfLoop = (array) => {
  const result = []
  for (const i of array) {result.push(i)}
  return result
}
const whileLoop = (array) => {
  const result = []
  let i = array.length
  while (i--) {result.push(array[i])}
  return result
}
const arraySpread = (array, value) => [value, ...array]
const arrayUnshift = (array, value) => array.unshift(value) && array
const sortNative = (array, key) => array.sort(sort(key, 'desc'))
const sortBy = (array, ...args) => array.sort(by(...args))
const sortFirstBy = (array, key) => array.sort(firstBy(key, -1))
const sortThenBy = (array, key, key2) => array.sort(firstBy(key, -1).thenBy(key2, -1))
const totalReduce = (array) => array.reduce((total, value) => total + value, 0)
const arrayPush = (newList) => {
  const list = []
  list.push(...newList)
  return list
}
const arrayConcat = (newList) => {
  let list = []
  list = list.concat(newList)
  return list
}
const arrayIndexOf = (value) => superLongList.indexOf(value) > -1
const arrayIncludes = (value) => superLongList.includes(value)
bench.skip({name: 'intersection', log: '[0]', loop: 100000}, intersection, longList, shortList)
bench.skip({log: '[0]', loop: 100000}, hasCommonListValue, longList, shortList)
bench.skip({log: null, loop: 100}, arraySpread, [...longList], 'first')
bench.skip({log: null, loop: 100}, arrayUnshift, [...longList], 'first')  // ~ x2 times faster
bench.skip({log: null, loop: 10000}, forLoop, [...superLongList])
bench.skip({log: null, loop: 10000}, forLoopDecrement, [...superLongList])  // slowest
bench.skip({log: null, loop: 10000}, forOfLoop, [...superLongList])  // -> fastest
bench.skip({log: null, loop: 10000}, whileLoop, [...superLongList])  // same as forLoop()
bench.skip({log: '[0]', loop: 100000}, sortNative, [...objList], 'f')
bench.skip({log: '[0]', loop: 100000}, sortBy, [...objList], '-f')
bench.skip({log: '[0]', loop: 100000}, sortFirstBy, [...objList], 'f')
bench.skip({log: '[0]', loop: 100000}, sortBy, [...objList], '-f', '-l')  // ~ 30% faster than thenBy
bench.skip({log: '[0]', loop: 100000}, sortThenBy, [...objList], 'f', 'l')  // cannot sort by key path
bench.skip({log: '[0]', loop: 100000}, sortBy, [...objList], '-f', '-user.id')
bench.skip({loop: 10000}, shuffle, superLongList)
bench.skip({loop: 100000}, mergeLists, longList, longList)  // ~ faster than toUniqueListFast for very long lists (50+)
bench.skip({loop: 100000}, toUniqueListFast, longList.concat(longList))
bench.skip({log: '[0]', loop: 1000000}, totalReduce, longList)
bench.skip({log: '[0]', loop: 1000000}, toListTotal, longList)  // ~ 2.5 times faster than reduce
bench.skip({log: '[0]', loop: 1000000}, arrayPush, longList)
bench.skip({log: '[0]', loop: 1000000}, arrayConcat, longList)  // ~ 20% faster than arrayPush()
bench({log: '[0]', loop: 1000000}, arrayIndexOf, 111)
bench({log: '[0]', loop: 1000000}, arrayIncludes, 111)  // no difference compared to array.indexOf() check
