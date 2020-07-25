import qs from 'querystring'
import { bench } from '../log'
import { passStrength, } from '../utility'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

const params = {a: 1, b: [2, 3], id: 'Hi, God!', nonce: ''}
const key = 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j'
const message = 'symbol=LTCBTC&side=BUY&type=LIMIT&timestamp=1499827319559'
const typeOf = (val) => typeof val === 'string'
const constructor = (val) => val.constructor === String
const switchCase = (type) => {
  switch (type) {
    case '1':
      return 1
    case '2':
      return 2
    case '3':
      return 3
    default:
      return 0
  }
}
const ifCheck = (type) => {
  if (type === '1') {
    return 1
  } else if (type === '2') {
    return 2
  } else if (type === '3') {
    return 3
  }
  return 0
}
bench({log: '[0]', loop: 100000}, typeOf, message)
bench({log: '[0]', loop: 100000}, constructor, message)
bench({name: 'qs.stringify', log: '[0]', loop: 100000}, qs.stringify, params)
bench({log: '[0]', loop: 1000}, switchCase, key)
bench({log: '[0]', loop: 1000}, ifCheck, key) // same as switch case
bench({log: ''}, passStrength, 'TestPasswordStrength')
