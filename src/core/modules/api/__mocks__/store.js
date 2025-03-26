import configureStore from 'redux-mock-store'
import createSagaMiddleware from 'redux-saga'
import thunk from 'redux-thunk'
import { createApiMiddleware } from '../middleware'

export const apiMiddleware = createApiMiddleware({useFetch: false})
export const sagaMiddleware = createSagaMiddleware()
export const middlewares = [
  apiMiddleware,
  thunk,
  sagaMiddleware
]
const mockStore = configureStore(middlewares)
export default mockStore
