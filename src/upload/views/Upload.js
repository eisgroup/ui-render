import classNames from 'classnames'
import { POPUP, POPUP_ALERT } from 'modules-pack/popup/constants'
import { connect, stateAction } from 'modules-pack/redux'
import { ROUTE_HOME, UPLOAD as U } from 'modules-pack/variables'
import React, { Fragment, PureComponent } from 'react'
import Dropzone from 'react-dropzone'
import { type, withTimer } from 'react-ui-pack'
import Icon from 'react-ui-pack/Icon'
import Loading from 'react-ui-pack/Loading'
import Row from 'react-ui-pack/Row'
import Text from 'react-ui-pack/Text'
import Tooltip from 'react-ui-pack/Tooltip'
import View from 'react-ui-pack/View'
import {
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
    upload: (files, fileType) => dispatch(stateAction(UPLOAD, SET, {files, fileType})),
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
    fileType: type.OneOf(type.String, type.Number),
    /* Allowed file formats, example: ['jpg', 'png'] */
    formats: type.ListOf(type.String),
    /* Maximum File size in bytes */
    maxSize: type.Number,
    /* Callback(acceptedFiles, name) onDrop files */
    onChange: type.Method,
    /* Callback when close button is clicked (ex. history.goBack()) */
    onClose: type.Method,
    /* Callback when cancel upload or on drag leave */
    onBlur: type.Method,
    /* Callback when choose file or on drag enter */
    onFocus: type.Method,
    /* Callback(instance, ...componentWillMountProps) before component mounts */
    onComponentWillMount: type.Method,
    loading: type.Boolean,
    disabled: type.Boolean, // whether to disable upload
    readonly: type.Boolean, // whether to make upload viewable only
    multiple: type.Boolean, // whether to allow multiple file uploads, true by default
    hasHeader: type.Boolean, // whether to show title above the upload
    showTypes: type.Boolean, // whether to show file types tooltip
    round: type.Boolean, // whether to add `round` css class
    label: type.String, // optional label to show in the title
    labelOnHover: type.String, // optional label to show on Dropzone hover
    children: type.Any,
  }

  static defaultProps = {
    loading: false,
    multiple: true,
    showTypes: true,
  }

  state = {
    active: false
  }

  get formats () {
    const {formats} = this.props
    return formats ? `.${formats.join(', .')}` : (U.BY_ROUTE[this.fileType] || {}).fileTypes
  }

  get maxSize () {
    return this.props.maxSize || (U.BY_ROUTE[this.fileType] || {}).maxSize
  }

  get fileType () {
    return this.props.fileType || this.uri.split(/\//).pop().toLowerCase()
  }

  get uri () {
    return get(this.props, 'location.pathname', ROUTE_HOME)
  }

  onDragEnter = (...args) => this.setState({active: true}, () => this.props.onFocus && this.props.onFocus(...args))
  onDragLeave = (...args) => this.setState({active: false}, () => this.props.onBlur && this.props.onBlur(...args))

  handleUpload = (acceptedFiles, rejectedFiles) => {
    log('acceptedFiles:', acceptedFiles)
    log('rejectedFiles:', rejectedFiles)
    const {actions, onChange, name} = this.props
    if (hasListValue(acceptedFiles)) {
      const maxSize = this.maxSize
      for (const file of acceptedFiles) {
        if (file.size > maxSize) return actions.popup({
          title: _.MAXIMUM_FILE_SIZE_EXCEEDED,
          content: <Row className="center wrap">
            <Text className="bold margin-h-smaller">{file.name}</Text>
            <Text>{_.MUST_BE_UNDER}</Text>
            <Text className="bold margin-h-smaller">{shortNumber(maxSize, 3, SIZE_KB)}B</Text>
          </Row>,
          closeLabel: _.OK
        })
      }
      actions.upload(acceptedFiles, this.fileType)
      isFunction(onChange) && onChange(acceptedFiles, name)
    } else {
      actions.popup({
        title: _.FILE_UPLOAD_FAILED,
        content: <View className='center wrap'>
          <Text>{_.UPLOAD}</Text>
          <Text className="p bold">{this.formats}</Text>
          <Text>{_.FILES_ONLY}</Text>
        </View>,
        closeLabel: _.OK
      })
    }
  }

  handleKeyPress = event => {
    if (event.key === 'Enter') this.dropzone.open()
  }

  renderClose = (handleClose) => (
    <View className="app__view--close" onClick={handleClose}>
      <Text className="app__view--close__icon">{'✕'}</Text>
      <Tooltip top>{_.CLOSE}</Tooltip>
    </View>
  )

  UNSAFE_componentWillMount (...args) {
    this.props.onComponentWillMount && this.props.onComponentWillMount(this, ...args)
    // if (this.props.fileType == null && !window.prevLocation) {  // if this route is accessed directly in browser
    //   history.push(ROUTE_HOME)  // go to homepage first,
    //   this.setTimeout(() => { // then open as Modal
    //     openModal(this.uri, {className: 'fill--three-quarter'})
    //   }, 100)
    // }
  }

  render () {
    const {
      loading, children, multiple, disabled, readonly, onBlur, name, labelOnHover, onClose,
      className, hasHeader, round, showTypes, title,
    } = this.props
    const label = this.props.label || this.fileType || _.FILE
    const {active} = this.state
    const formats = this.formats
    return (
      <View className={classNames('app__upload', {round})}>
        {onClose && this.renderClose(onClose)}
        {hasHeader && <h2>{parseString(_.UPLOAD_file, {file: label})}</h2>}
        <Dropzone
          // @note: When tabbing to dropzone with keyboard, input[type="file"] also gets event -> causing open twice.
          //      => input is hidden by dropzone because it has ugly "Choose File" button
          name={name}
          title={title}
          inputProps={inputProps}
          tabIndex={disabled ? -1 : 0}
          className={classNames('upload__dropzone', className, {active, round, disabled, readonly})}
          ref={(node) => { this.dropzone = node }}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          onDrop={this.handleUpload}
          onFileDialogCancel={onBlur}
          onKeyPress={this.handleKeyPress}
          accept={formats}
          multiple={multiple}
          disabled={disabled || readonly}
        >
          {children || <Fragment>
            <Icon name="image" className="text largest no-margin"/>
            <Text className='p margin-top-smallest'>
              {_.SELECT_OR_DROP}<br/>
              {pluralize(label, multiple ? 2 : 1)}
            </Text>
          </Fragment>
          }
          {showTypes &&
          <View className="dropzone__hover position-fill align-center appear-on-hover">
            <View className="padding text-outline">
              <View className="dropzone__hover__bg position-fill bg-neutral radius-large"/>
              <Text className="margin-bottom-smaller">
                {labelOnHover || parseString(_.UPLOAD_file_FILE, {file: label})}
              </Text>
              <Text className="bold p">{formats.replace(/\./g, '')}</Text>
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
