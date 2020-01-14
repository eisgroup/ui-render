import { NAME } from './constants'
import { createSocketMiddleware } from './middleware'

export { createSocketMiddleware }
export default {
  NAME,
  middleware: createSocketMiddleware()
}
