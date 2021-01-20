import React, { PureComponent } from 'react'
import { FormSpy } from 'react-final-form'
import { PropTypes } from 'react-ui-pack'
import { Loading } from 'react-ui-pack/Loading'
import { debounce, l, localiseTranslation, objChanges, TIME_DURATION_INSTANT } from 'utils-pack'
import { _ } from 'utils-pack/translations'

if (!_.SYNCING___) {
  _.SYNCING___ = {
    [l.ENGLISH]: 'Syncing...',
  }
  localiseTranslation(_)
}

/**
 * Final Form Auto Save on Input Value Changes
 * @example:
 *   <AutoSave onChange={console.warn} partial showLoader />
 */
export default class AutoSave extends PureComponent {
  static propTypes = {
    // Async Function(values) to call on input changes
    onChange: PropTypes.func.isRequired,
    // Whether to save only changed values, default is all Form values
    partial: PropTypes.bool,
    // Whether to overlay parent container with Loading spinner component
    showLoader: PropTypes.bool,
    // FormSpy subscription
    subscription: PropTypes.object,
    // Milliseconds to delay form `onChange`
    delay: PropTypes.number,
    // Loading message
    loadContent: PropTypes.any,
  }

  static defaultProps = {
    delay: TIME_DURATION_INSTANT,
    subscription: {values: true},
  }

  state = {
    values: undefined,
    submitting: false
  }

  UNSAFE_componentWillReceiveProps (next, _) {
    if (next.delay !== this.props.delay) this.handleChange = debounce(this.onChange, next.delay)
  }

  onChange = async ({values}) => {
    if (this.state.values == null) return this.setState({values})

    if (this.promise) await this.promise
    const {onChange, partial} = this.props

    // This diff step is totally optional
    const changes = objChanges(this.state.values, values)
    if (changes) {
      // values have changed
      this.setState({submitting: true, values})
      this.promise = onChange(partial ? changes : values)
      await this.promise
      delete this.promise
      this.setState({submitting: false})
    }
  }

  handleChange = debounce(this.onChange, this.props.delay)

  renderLoading = () => {
    const {showLoader, loadContent} = this.props
    const {submitting} = this.state
    if (!showLoader || !submitting) return null
    return <Loading loading>{loadContent || _.SYNCING___}</Loading>
  }

  // Make a HOC
  // This is not the only way to accomplish auto-save, but it does let us:
  // - Use built-in React lifecycle methods to listen for changes
  // - Maintain state of when we are submitting
  // - Render a message when submitting
  // - Pass in delay and save props nicely
  // This component doesn't have to render anything, but it can render submitting state.
  render () {
    const {subscription} = this.props
    return <>
      {/* FormSpy onChange will be called once on component mount */}
      <FormSpy subscription={subscription} onChange={this.handleChange}/>
      {this.renderLoading()}
    </>
  }
}
