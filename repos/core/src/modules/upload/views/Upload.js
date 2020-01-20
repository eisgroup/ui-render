import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import Dropzone from 'react-dropzone'
import { SIZE_KB, stateAction } from '../../../common/actions'
import { OPEN, SET } from '../../../common/constants'
import { connect } from '../../../common/redux'
import { capitalize, get, hasListValue, isFunction, log, pluralize, shortNumber } from '../../../common/utils'
import { ROUTE_HOME, UPLOAD_BY_ROUTE } from '../../../common/variables'
import Icon from '../../../components/Icon'
import Loading from '../../../components/Loading'
import Row from '../../../components/Row'
import Text from '../../../components/Text'
import Tooltip from '../../../components/Tooltip'
import { withTimer } from '../../../components/utils'
import View from '../../../components/View'
import { POPUP, POPUP_ALERT } from '../../exports'
import { history } from '../../router'
import { NAME as UPLOAD } from '../constants'
import select from '../selectors'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  ui: select.ui(state)
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    upload: (files, id) => dispatch(stateAction(UPLOAD, SET, { files, id })),
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
export default class Upload extends Component {
  static propTypes = {
    // If 'id' given, will render as embedded component, instead of Modal route
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    onUpload: PropTypes.func, // callback onDrop files with (acceptedFiles, this.id) arguments
    isLoading: PropTypes.bool,
    hasTooltip: PropTypes.bool, // default is true - show file types tooltip
    multiple: PropTypes.bool, // whether to allow multiple file uploads, true by default
    round: PropTypes.bool, // whether to add `round` css class
    label: PropTypes.string, // optional label to show in the title
    children: PropTypes.any
  }

  state = {
    active: false
  }

  get fileTypes () {
    return (UPLOAD_BY_ROUTE[this.id] || {}).fileTypes
  }

  get maxSize () {
    return (UPLOAD_BY_ROUTE[this.id] || {}).maxSize
  }

  get id () {
    return this.props.id || this.uri.split(/\//).pop().toLowerCase()
  }

  get uri () {
    return get(this.props, 'location.pathname', ROUTE_HOME)
  }

  onDragEnter = () => this.setState({ active: true })
  onDragLeave = () => this.setState({ active: false })

  openInModal = (uri) => {
    history.push({
      pathname: uri || this.uri,
      state: { isModal: true, className: 'fill--three-quarter' }
    })
  }

  handleCloseModal = () => {
    history.goBack()
  }

  handleUpload = (acceptedFiles, rejectedFiles) => {
    log('acceptedFiles:', acceptedFiles)
    log('rejectedFiles:', rejectedFiles)
    const { actions, onUpload } = this.props
    if (hasListValue(acceptedFiles)) {
      const maxSize = this.maxSize
      for (const file of acceptedFiles) {
        if (file.size > maxSize) return actions.popup({
          title: 'Maximum File Size Exceeded!',
          content: <Row className='center wrap'>
            <Text className='bold margin-h-smaller'>{file.name}</Text>
            <Text>must be under</Text>
            <Text className='bold margin-h-smaller'>{shortNumber(maxSize, 3, SIZE_KB)}B</Text>
          </Row>,
          closeLabel: 'OK'
        })
      }
      actions.upload(acceptedFiles, this.id)
      isFunction(onUpload) && onUpload(acceptedFiles, this.id)
    } else {
      actions.popup({
        title: 'File Upload Failed!',
        content: <View className='center wrap'>
          <Text>{`Upload`}</Text>
          <Text className='p bold'>{this.fileTypes}</Text>
          <Text>{`files only`}</Text>
        </View>,
        closeLabel: 'OK'
      })
    }
  }

  handleKeyPress = event => {
    if (event.key === 'Enter') this.dropzone.open()
  }

  renderClose = (handleClose) => (
    <View className='app__view--close' onClick={handleClose}>
      <Text className='app__view--close__icon'>{'✕'}</Text>
      <Tooltip top>Close</Tooltip>
    </View>
  )

  UNSAFE_componentWillMount () {
    if (this.props.id == null && !window.prevLocation) {  // if this route is accessed directly in browser
      history.push(ROUTE_HOME)  // go to homepage first,
      this.setTimeout(this.openInModal, 100)  // then open as Modal
    }
  }

  render () {
    const { ui, id, hasHeader = true, isLoading, children, className, round, multiple = true, hasTooltip = true } = this.props
    const label = this.props.label || id || this.id
    const { active } = this.state
    const fileTypes = this.fileTypes
    return (
      <View className={classNames('app__upload', { round })}>
        {id == null && this.renderClose(this.handleCloseModal)}
        {hasHeader && <h2>{`Upload ${capitalize(label) || 'File'}`}</h2>}
        <Dropzone
          tabIndex="0"
          className={classNames('app__upload__dropzone', className, { active, round })}
          ref={(node) => { this.dropzone = node }}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          onDrop={this.handleUpload}
          onKeyPress={this.handleKeyPress}
          accept={fileTypes}
          multiple={multiple}
        >
          {children || <Fragment>
            <Icon name="media" className="text largest no-margin"/>
            <Text className='p'>
              Select or Drop<br/>
              {pluralize(capitalize(label), multiple ? 2 : 1)}
            </Text>
          </Fragment>
          }
          {hasTooltip &&
          <Tooltip top className='flex--col'>
            <Text className='margin-bottom-smaller'>File Types</Text>
            <Text className='bold p'>{fileTypes}</Text>
          </Tooltip>
          }
        </Dropzone>
        <Loading isLoading={isLoading || ui.isLoading}/>
      </View>
    )
  }
}
