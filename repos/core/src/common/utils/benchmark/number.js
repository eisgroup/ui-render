import { bench } from '../log'
import { decimalPlaces, formatNumber, round, shortNumber } from '../number'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

const mathFloor = (number) => Math.floor(number)
const mathTilde = (number) => ~~number
const toFixed = (val, precision) => val.toFixed(precision)
const mathPow = (number, number2) => Math.pow(number + number2, 2)
const mathMultiply = (number, number2) => (number + number2) * (number + number2)

function toDecimal (num) {
  //if the number is in scientific notation remove it
  if (/\d+\.?\d*e[+\-]*\d+/i.test(num)) {
    let zero = '0',
      parts = String(num).toLowerCase().split('e'), // split into coefficient and exponent
      e = parts.pop(),//store the exponential part
      l = Math.abs(e), //get the number of zeros
      sign = e / l,
      coefficientArray = parts[0].split('.')
    if (sign === -1) {
      num = zero + '.' + new Array(l).join(zero) + coefficientArray.join('')
    }
    else {
      const dec = coefficientArray[1]
      if (dec) l = l - dec.length
      num = coefficientArray.join('') + new Array(l + 1).join(zero)
    }
  }

  return num
}

bench({log: '[0]', loop: 100}, decimalPlaces, 0.001)
bench({log: '[0]', loop: 1000000}, mathFloor, 0.123456789)  // ~ 15% faster than ~~number in Node.js
bench({log: '[0]', loop: 1000000}, mathTilde, 0.123456789)
bench({log: '[0]', loop: 100000}, round, 0.123456789, 8)  // ~ 5 times faster than toFixed()
bench({log: '[0]', loop: 100000}, toFixed, 0.123456789, 8)
bench({log: '[0]', loop: 100000}, Number, '0.123456789')  // ~ 2 times faster than parseFloat()
bench({log: '[0]', loop: 100000}, parseFloat, '0.123456789')
bench({log: '[0]', loop: 100000}, toDecimal, String(-1534567890.00123))
bench({log: '[0]', loop: 100000}, shortNumber, 1234567890.00123)
bench({log: '[0]', loop: 100000}, formatNumber, -1534567890.00123, {decimals: 3})
bench({log: '[0]', loop: 10000000}, mathPow, 11, 10)
bench({log: '[0]', loop: 10000000}, mathMultiply, 11, 10)  // 10% faster than mathPow
