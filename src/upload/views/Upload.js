import classNames from 'classnames'
import { NAME as POPUP, POPUP_ALERT } from 'modules-pack/popup/constants'
import { connect, stateAction } from 'modules-pack/redux'
import { ROUTE_HOME, UPLOAD as U } from 'modules-pack/variables'
import PropTypes from 'prop-types'
import React, { Fragment, PureComponent } from 'react'
import Dropzone from 'react-dropzone'
import { withTimer } from 'react-ui-pack'
import Icon from 'react-ui-pack/Icon'
import Loading from 'react-ui-pack/Loading'
import Row from 'react-ui-pack/Row'
import Text from 'react-ui-pack/Text'
import Tooltip from 'react-ui-pack/Tooltip'
import View from 'react-ui-pack/View'
import { capitalize, get, hasListValue, isFunction, log, OPEN, pluralize, SET, shortNumber, SIZE_KB } from 'utils-pack'
import { NAME as UPLOAD } from '../constants'
import select from '../selectors'
import { _ } from '../translations'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  loading: select.isLoading(state)
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    upload: (files, id) => dispatch(stateAction(UPLOAD, SET, {files, id})),
    popup: (item) => dispatch(stateAction(POPUP, OPEN, {
      activePopup: POPUP_ALERT,
      [POPUP_ALERT]: {
        items: [item]
      }
    }))
  }
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps, mapDispatchToProps)
@withTimer
export default class Upload extends PureComponent {
  static propTypes = {
    // If 'id' given, will render as embedded component, instead of Modal route
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    /* Callback(acceptedFiles, this.id) onDrop files */
    onUpload: PropTypes.func,
    /* Callback when close button is clicked (ex. history.goBack()) */
    onClose: PropTypes.func,
    /* Callback when cancel upload or on drag leave */
    onBlur: PropTypes.func,
    /* Callback when choose file or on drag enter */
    onFocus: PropTypes.func,
    /* Callback(instance, ...componentWillMountProps) before component mounts */
    onComponentWillMount: PropTypes.func,
    loading: PropTypes.bool,
    disabled: PropTypes.bool, // whether to disable upload
    readonly: PropTypes.bool, // whether to make upload viewable only
    multiple: PropTypes.bool, // whether to allow multiple file uploads, true by default
    hasHeader: PropTypes.bool, // whether to show title above the upload
    showTypes: PropTypes.bool, // whether to show file types tooltip
    round: PropTypes.bool, // whether to add `round` css class
    label: PropTypes.string, // optional label to show in the title
    children: PropTypes.any,
  }

  static defaultProps = {
    multiple: true,
    hasHeader: true,
    showTypes: true,
  }

  state = {
    active: false
  }

  get fileTypes () {
    return (U.BY_ROUTE[this.id] || {}).fileTypes
  }

  get maxSize () {
    return (U.BY_ROUTE[this.id] || {}).maxSize
  }

  get id () {
    return this.props.id || this.uri.split(/\//).pop().toLowerCase()
  }

  get uri () {
    return get(this.props, 'location.pathname', ROUTE_HOME)
  }

  onDragEnter = (...args) => this.setState({active: true}, () => this.props.onFocus && this.props.onFocus(...args))
  onDragLeave = (...args) => this.setState({active: false}, () => this.props.onBlur && this.props.onBlur(...args))

  handleUpload = (acceptedFiles, rejectedFiles) => {
    log('acceptedFiles:', acceptedFiles)
    log('rejectedFiles:', rejectedFiles)
    const {actions, onUpload} = this.props
    if (hasListValue(acceptedFiles)) {
      const maxSize = this.maxSize
      for (const file of acceptedFiles) {
        if (file.size > maxSize) return actions.popup({
          title: _.MAXIMUM_FILE_SIZE_EXCEEDED,
          content: <Row className='center wrap'>
            <Text className='bold margin-h-smaller'>{file.name}</Text>
            <Text>{_.MUST_BE_UNDER}</Text>
            <Text className='bold margin-h-smaller'>{shortNumber(maxSize, 3, SIZE_KB)}B</Text>
          </Row>,
          closeLabel: _.OK
        })
      }
      actions.upload(acceptedFiles, this.id)
      isFunction(onUpload) && onUpload(acceptedFiles, this.id)
    } else {
      actions.popup({
        title: _.FILE_UPLOAD_FAILED,
        content: <View className='center wrap'>
          <Text>{_.UPLOAD}</Text>
          <Text className='p bold'>{this.fileTypes}</Text>
          <Text>{_.FILES_ONLY}</Text>
        </View>,
        closeLabel: _.OK
      })
    }
  }

  handleKeyPress = event => {
    if (event.key === 'Enter') this.dropzone.open()
  }

  renderClose = (handleClose = this.props.onClose) => (
    <View className='app__view--close' onClick={handleClose}>
      <Text className='app__view--close__icon'>{'✕'}</Text>
      <Tooltip top>{_.CLOSE}</Tooltip>
    </View>
  )

  UNSAFE_componentWillMount (...args) {
    this.props.onComponentWillMount && this.props.onComponentWillMount(this, ...args)
    // if (this.props.id == null && !window.prevLocation) {  // if this route is accessed directly in browser
    //   history.push(ROUTE_HOME)  // go to homepage first,
    //   this.setTimeout(() => { // then open as Modal
    //     openModal(this.uri, {className: 'fill--three-quarter'})
    //   }, 100)
    // }
  }

  render () {
    const {
      id, loading, children, multiple, disabled, readonly, onBlur, onFocus,
      className, hasHeader, round, showTypes
    } = this.props
    const label = this.props.label || id || this.id
    const {active} = this.state
    const fileTypes = this.fileTypes
    return (
      <View className={classNames('app__upload', {round})}>
        {id == null && this.renderClose()}
        {hasHeader && <h2>{`${_.UPLOAD} ${capitalize(label) || _.FILE}`}</h2>}
        <Dropzone
          // @note: When tabbing to dropzone with keyboard, input[type="file"] also gets event -> causing open twice.
          //      => input is hidden by dropzone because it has ugly "Choose File" button
          inputProps={inputProps}
          tabIndex={disabled ? -1 : 0}
          className={classNames('upload__dropzone', className, {active, round, disabled, readonly})}
          ref={(node) => { this.dropzone = node }}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          onDrop={this.handleUpload}
          onFileDialogCancel={onBlur}
          onKeyPress={this.handleKeyPress}
          accept={fileTypes}
          multiple={multiple}
          disabled={disabled || readonly}
        >
          {children || <Fragment>
            <Icon name="image" className="text largest no-margin"/>
            <Text className='p margin-top-smallest'>
              {_.SELECT_OR_DROP}<br/>
              {pluralize(capitalize(label), multiple ? 2 : 1)}
            </Text>
          </Fragment>
          }
          {showTypes &&
          <View className='position-fill align-center appear-on-hover'>
            <View className='padding text-outline'>
              <View className='position-fill bg-neutral radius-large' style={{opacity: 0.8}}/>
              <Text className='margin-bottom-smaller'>{_.FILE}</Text>
              <Text className='bold p'>{fileTypes}</Text>
            </View>
          </View>
          }
        </Dropzone>
        <Loading isLoading={loading}/>
      </View>
    )
  }
}

const inputProps = {tabIndex: -1}
