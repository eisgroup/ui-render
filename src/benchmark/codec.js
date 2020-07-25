import CircularJSON from 'circular-json-es6'
import { fromJSON, toJSON } from '../codec'
import { bench } from '../log'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

const obj2 = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, h: 7, i: 8, j: 9, k: 10, g: 11}

bench({name: 'CircularJSON.stringify', log: '[0]', loop: 100000}, CircularJSON.stringify, obj2)
bench({log: '[0]', loop: 100000}, toJSON, obj2)
bench({name: 'CircularJSON.parse', log: '[0]', loop: 100000}, CircularJSON.parse, '[7]')
bench({log: '[0]', loop: 100000}, fromJSON, '[7]')
