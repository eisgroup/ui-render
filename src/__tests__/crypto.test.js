import { CRYPTO } from '../constants'
import { cryptoSign, cryptoSignVerify, decrypt, encrypt, } from '../crypto'

describe(`Crypto Signing`, () => {
  const algo = CRYPTO.HMAC_SHA256
  const message = 'God'
  const secret = 'is everywhere'
  const signature = 'e614b36ac305188ce9f4a6ed1fa5a18affbe2a5ef40e4abf545b80f8af4ee5e0'

  it(`${cryptoSign.name}() returns correct hash signature`, () => {
    expect(cryptoSign(message, secret, algo)).toEqual(signature)
  })

  it(`${cryptoSignVerify.name}() returns true when signature is valid`, () => {
    expect(cryptoSignVerify(signature, message, secret, algo)).toBe(true)
    expect(cryptoSignVerify(undefined, message, secret, algo)).toBe(false)
    expect(cryptoSignVerify('', message, secret, algo)).toBe(false)
    expect(cryptoSignVerify(signature, undefined, secret, algo)).toBe(false)
    expect(cryptoSignVerify(signature, '', secret, algo)).toBe(false)
  })
})

describe(`Encryption and Decryption`, () => {
  const algo = 'aes-256-ctr'
  const message = 'God is everywhere... yet no where to be found...'
  const secret = 'needs to be at least 32 characters long'
  let encrypted = ''

  it(`${encrypt.name}() works correctly`, () => {
    encrypted = encrypt(message, secret, algo)
    expect(encrypted.length).toEqual(128)
  })

  it(`${decrypt.name}() works correctly`, () => {
    expect(decrypt(encrypted, secret, algo)).toEqual(message)
  })
})
