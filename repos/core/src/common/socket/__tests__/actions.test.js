import qs from 'querystring'
import { stateAction } from '../../actions'
import { SEND } from '../../constants'
import { cryptoSign } from '../../utils/crypto'
import { isSigned } from '../actions'
import { NAME as SOCKET } from '../constants'

describe(`${isSigned.name}()`, () => {
  const message = 'God'
  const secret = 'is everywhere'
  const action = stateAction(SOCKET, SEND, { message })
  const signature = cryptoSign(qs.stringify(action), secret)
  const payload = { action, signature }
  it(`returns true when action payload is correctly signed`, () => {
    expect(isSigned({ ...payload }, secret)).toBe(true)
    expect(isSigned({ ...payload, signature: 'if here' }, secret)).toBe(false)
    expect(isSigned(payload, 'invalid')).toBe(false)
  })
})
