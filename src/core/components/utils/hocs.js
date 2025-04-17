
/**
 * React Component Timer Decorator to clearTimeout() and clearInterval() automatically on componentWillUnmount()
 * @example:
 *    @withTimer
 *    class Homepage extends Component {
 *      animate = () => {
 *        this.setTimeout(this.props.animate, 500)
 *        this.setInterval(this.props.refresh, 500)
 *      }
 *    }
 *
 * @param {Object} Class - to be decorated
 */
export function withTimer (Class) {
  const componentWillUnmount = Class.prototype.componentWillUnmount

  Class.prototype.setTimeout = function () {
    if (!this.timers) this.timers = []
    this.timers.push(setTimeout(...arguments))
  }

  Class.prototype.clearTimer = function () {
    if (this.timers) this.timers.forEach(clearTimeout)
  }

  Class.prototype.componentWillUnmount = function () {
    this.clearTimer()
    if (componentWillUnmount) componentWillUnmount.apply(this, arguments)
  }

  return Class
}
