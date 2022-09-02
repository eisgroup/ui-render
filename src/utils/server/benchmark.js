import { bench } from 'ui-utils-pack'
import { compareHash, generateHash } from './crypto'

/**
 * BENCHMARK TESTS =============================================================
 * =============================================================================
 */

const message = 'God is here!'
const hash = '$2a$10$QR08832.wyXXlDOLiUpxUOMFNdR7eRuBXIQvrMvJHAPIJpCHfa28e'
bench({type: 'hash', log: '[0]', loop: 10}, generateHash, message, false)
bench({type: 'hash', log: '[0]', loop: 10}, compareHash, message, hash, false)
