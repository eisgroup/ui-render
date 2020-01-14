import { START } from '../../constants'
import { bench } from '../log'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

const TYPE = `${START}_module_name`
const pattern = new RegExp(`^${START}`)
const regexTest = (val) => pattern.test(val)
const matchTest = (val) => !val || val.match(pattern)
const indexTest = (val) => !val || val.indexOf(START) === 0

bench({log: '[0]', loop: 1000}, indexTest, TYPE)  // -> fastest
bench({log: '[0]', loop: 1000}, matchTest, TYPE)
bench({log: '[0]', loop: 1000}, regexTest, TYPE)
