import _ from 'lodash'
import { isFunction } from '../function'
import { bench } from '../log'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

const funcPositionalArgs = (a, b, c) => a + b + c
const funcKeywordArgs = ({a, b, c}) => a + b + c

bench({log: '[0]', loop: 1000000}, isFunction, () => {})
bench({name: 'constructor.name', loop: 1000000}, (val) => !!val && val.constructor.name === 'Function', () => {})
bench({name: 'constructor', loop: 1000000}, (val) => !!val && val.constructor === Function, () => {})  // ~ 30% faster
bench({name: '_.isFunction', log: '[0]', loop: 1000000}, _.isFunction, () => {})
bench({log: '[0]', loop: 100000}, funcPositionalArgs, 1.1, 2.2, 3.3)
bench({log: '[0]', loop: 100000}, funcKeywordArgs, {a: 1.1, b: 2.2, c: 3.3})  // ~ same as positional
