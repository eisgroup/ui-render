import { NAME } from './constants'
import middleware from './middleware'

export * from './actions'
export * from './middleware'

const socket = {
  NAME,
  middleware,
}

export default socket
