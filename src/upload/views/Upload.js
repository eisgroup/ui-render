import classNames from 'classnames'
import { POPUP, POPUP_ALERT } from 'modules-pack/popup/constants'
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
import {
  capitalize,
  get,
  hasListValue,
  interpolateString as parseString,
  isFunction,
  log,
  OPEN,
  pluralize,
  SET,
  shortNumber,
  SIZE_KB
} from 'utils-pack'
import { UPLOAD } from '../constants'
import select from '../selectors'
import { _ } from '../translations'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  loading: select.loading(state)
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    upload: (files, type) => dispatch(stateAction(UPLOAD, SET, {files, type})),
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
 * todo: fix Dropzone opening upload window twice (try fast upload)
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps, mapDispatchToProps)
@withTimer
export default class Upload extends PureComponent {
  static propTypes = {
    // Upload file type, falls back to Route pathname
    // If given, will render as embedded component, instead of Modal route
    type: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    /* Callback(acceptedFiles, this.type) onDrop files */
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
    labelOnHover: PropTypes.string, // optional label to show on Dropzone hover
    children: PropTypes.any,
  }

  static defaultProps = {
    loading: false,
    multiple: true,
    hasHeader: true,
    showTypes: true,
  }

  state = {
    active: false
  }

  get fileTypes () {
    return (U.BY_ROUTE[this.type] || {}).fileTypes
  }

  get maxSize () {
    return (U.BY_ROUTE[this.type] || {}).maxSize
  }

  get type () {
    return this.props.type || this.uri.split(/\//).pop().toLowerCase()
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
      actions.upload(acceptedFiles, this.type)
      isFunction(onUpload) && onUpload(acceptedFiles, this.type)
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
    // if (this.props.type == null && !window.prevLocation) {  // if this route is accessed directly in browser
    //   history.push(ROUTE_HOME)  // go to homepage first,
    //   this.setTimeout(() => { // then open as Modal
    //     openModal(this.uri, {className: 'fill--three-quarter'})
    //   }, 100)
    // }
  }

  render () {
    const {
      type, loading, children, multiple, disabled, readonly, onBlur, labelOnHover,
      className, hasHeader, round, showTypes
    } = this.props
    const label = this.props.label || this.type || _.FILE
    const {active} = this.state
    const fileTypes = this.fileTypes
    const fileLabel = capitalize(label)
    const file = capitalize(this.type || '')
    return (
      <View className={classNames('app__upload', {round})}>
        {type == null && this.renderClose()}
        {hasHeader && <h2>{parseString(_.UPLOAD_file, {file: fileLabel})}</h2>}
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
              {pluralize(fileLabel, multiple ? 2 : 1)}
            </Text>
          </Fragment>
          }
          {showTypes &&
          <View className="dropzone__hover position-fill align-center appear-on-hover">
            <View className="padding text-outline">
              <View className="dropzone__hover__bg position-fill bg-neutral radius-large"/>
              <Text className="margin-bottom-smaller">{labelOnHover || parseString(_.UPLOAD_file_FILE, {file})}</Text>
              <Text className="bold p">{fileTypes.replace(/\./g, '')}</Text>
            </View>
          </View>
          }
        </Dropzone>
        <Loading loading={loading}/>
      </View>
    )
  }
}

const inputProps = {tabIndex: -1}
