import backOff from 'backoff'
import { Active, Json } from 'utils-pack'
import { SOCKET_CLOSE_EVENT } from './constants'

// =============================================================================
// SOCKET CONNECTION INSTANCE
// =============================================================================

export default class Connection {
  constructor (endpoint, params, config = {}) {
    this.endpoint = endpoint
    this.params = params
    this.backingOff = false
    this.messages = new MessageQueue()
    this.codec = config.codec || Json
    this.Socket = Active.WebSocket
  }

  get isConnected () {
    return this.connection.readyState === this.Socket.OPEN
  }

  /**
   * New Socket Connection Initialisation
   *
   * @return {Socket} - connection
   */
  subscribe ({onOpen, onClose, onError, onMessage}) {
    this.connection = new this.Socket(this.endpoint)
    this.handle = {onOpen, onClose, onError, onMessage}
    Object.assign(
      this.connection,
      {
        onopen: this._onOpen.bind(this),
        onerror: this._onError.bind(this),
        onmessage: this._onMessage.bind(this),
        onclose: this._onClose.bind(this)
      }
    )
    return this
  }

  close (...args) {
    this.connection.close(...args)
  }

  send (data) {
    if (this.isConnected) {
      this.connection.send(this.codec.encode(data))
    } else {
      this.messages.enqeue(data)
    }
  }

  _onOpen (event) {
    /* Send queued messages */
    while (this.messages.hasQueue && this.isConnected) {
      this.send(this.messages.dequeue())
    }
    this.handle.onOpen(event)
  }

  _onMessage (event) {
    this.handle.onMessage(this.codec.decode(event.data))
  }

  _onError (err) {
    this.handle.onError(err)
    this._reconnect()
  }

  _onClose (CloseEvent) {
    this.handle.onClose(CloseEvent)
    const {code, reason} = CloseEvent
    if (code !== SOCKET_CLOSE_EVENT[0] || reason !== SOCKET_CLOSE_EVENT[1]) this._reconnect()
  }

  _reconnect () {
    if (!this.backingOff) {
      this.backingOff = true

      setBackOff(nextBackOff => {
        if (!this.isConnected) {
          this.subscribe(this.handle)
          nextBackOff()
        } else {
          this.backingOff = false
        }
      })
    }
  }
}

export class MessageQueue {
  constructor (initialState = []) {
    this._queue = [...initialState]
  }

  get hasQueue () {
    return this._queue.length > 0
  }

  enqeue (x) {
    this._queue.push(x)
  }

  dequeue () {
    return this._queue.shift()
  }
}

function setBackOff (cb, failAfter = 6) {
  const bo = backOff.exponential({
    initialDelay: 1000
  })
  const doBackOff = bo.backoff.bind(bo)

  bo.on('ready', () => cb(doBackOff))

  bo.backoff()

  bo.failAfter(failAfter)
}
