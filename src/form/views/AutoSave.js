import React, { PureComponent } from 'react'
import { FormSpy } from 'react-final-form'
import { PropTypes } from 'react-ui-pack'
import { Loading } from 'react-ui-pack/Loading'
import { l, localiseTranslation, objChanges, TIME_DURATION_INSTANT } from 'utils-pack'
import { _ } from 'utils-pack/translations'

if (!_.SAVING___) {
  _.SAVING___ = {
    [l.ENGLISH]: 'Saving...',
  }
  localiseTranslation(_)
}

/**
 * Final Form Auto Save on Input Value Changes
 * @example:
 *   <AutoSave save={console.warn} partial showLoader />
 */
class AutoSave extends PureComponent {
  static propTypes = {
    // Async Function to call on input changes
    save: PropTypes.func.isRequired,
    // Whether to save only changed values, default is all Form values
    partial: PropTypes.bool,
    // Whether to overlay parent container with Loading spinner component
    showLoader: PropTypes.bool,
    // Milliseconds to delay form save
    debounce: PropTypes.number,
    // Form values
    values: PropTypes.object,
  }

  static defaultProps = {
    debounce: TIME_DURATION_INSTANT,
  }

  state = {
    values: this.props.values,
    submitting: false
  }

  UNSAFE_componentWillReceiveProps (next, __) {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(this.save, this.props.debounce)
  }

  save = async () => {
    if (this.promise) {
      await this.promise
    }
    const {values, save, partial} = this.props

    // This diff step is totally optional
    const changes = objChanges(this.state.values, values)
    if (changes) {
      // values have changed
      this.setState({submitting: true, values})
      this.promise = save(partial ? changes : values)
      await this.promise
      delete this.promise
      this.setState({submitting: false})
    }
  }

  // This component doesn't have to render anything, but it can render submitting state.
  render () {
    const {showLoader} = this.props
    const {submitting} = this.state
    if (!showLoader || !submitting) return null
    return <Loading isLoading>{_.SAVING___}</Loading>
  }
}

// Make a HOC
// This is not the only way to accomplish auto-save, but it does let us:
// - Use built-in React lifecycle methods to listen for changes
// - Maintain state of when we are submitting
// - Render a message when submitting
// - Pass in debounce and save props nicely
export default props => (
  <FormSpy subscription={subscription} {...props} component={AutoSave}/>
)

const subscription = {values: true}
