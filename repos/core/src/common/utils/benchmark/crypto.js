import { cryptoHash, cryptoSign, decrypt, encrypt } from '../crypto'
import { bench } from '../log'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

const key = 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j'
const message = 'symbol=LTCBTC&side=BUY&type=LIMIT&timestamp=1499827319559'

bench({log: '[0]', loop: 10000}, cryptoSign, message, key)
bench({log: '[0]', loop: 10000}, cryptoHash, message)
const encrypted = bench({log: ''}, encrypt, message, key)
bench({log: ''}, decrypt, encrypted, key)
