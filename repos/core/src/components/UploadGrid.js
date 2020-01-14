import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { OPEN, stateAction } from '../common/actions'
import { connect } from '../common/redux'
import { by, get, isEqual } from '../common/utils'
import { ROUTE_HOME } from '../common/variables'
import { POPUP, POPUP_ALERT, POPUP_CONFIRM } from '../modules/exports'
import Icon from './Icon'
import Row from './Row'
import Text from './Text'
import UploadImage from './UploadImage'
import View from './View'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapDispatchToProps = (dispatch) => ({
  actions: {
    alert: ({ file, aspectRatios }) => dispatch(stateAction(POPUP, OPEN, {
      activePopup: POPUP_ALERT,
      [POPUP_ALERT]: {
        items: [{
          title: 'Invalid Aspect Ratio!',
          content: <Row className='center wrap'>
            <Text className='bold margin-h-smaller'>{file.name}'s</Text>
            <Text>dimension must be one of </Text>
            <Text className='bold margin-h-smaller'>{aspectRatios.join(', ')}</Text>
          </Row>,
          closeLabel: 'OK'
        }]
      }
    })),
    remove: (file, callback) => dispatch(stateAction(POPUP, OPEN, {
      activePopup: POPUP_CONFIRM,
      [POPUP_CONFIRM]: {
        items: [{
          title: 'Confirm Action',
          content: `Are you sure you want to remove ${file.name}?`,
          confirmLabel: 'Remove',
          action: callback,
        }]
      }
    })),
  }
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Separate Media Files Uploader in Grid Layout (currently supports Images only)
 * @Note:
 *    - will register as redux form field when mounted
 *    - `onChange` fires redux form change action by default
 * -----------------------------------------------------------------------------
 */
@connect(null, mapDispatchToProps)
export default class UploadGrid extends Component {
  static propTypes = {
    id: PropTypes.string, // Upload file type, falls back to Route pathname, and default is 'images'
    value: PropTypes.arrayOf(PropTypes.shape({ // list of Dropzone file objects
      i: PropTypes.number.isRequired, // file position in the grid
      src: PropTypes.string, // file source URL
      name: PropTypes.string,
    })).isRequired,
    onChange: PropTypes.func, // callback when list of Media files changes, receives list of edited files as argument
    count: PropTypes.number, // number of files that can be uploaded, default is 9
    // @Note: see Upload module for other props (src/web/modules/upload/_View.js)
  }

  // Internal state synced with props for rendering temporary UI changes and keeping track of current files
  state = {
    files: this.props.value || []
  }

  changedValues = {}

  get id () {
    return this.props.id || this.uri.split(/\//).pop().toLowerCase() || 'images'
  }

  get uri () {
    return get(this.props, 'location.pathname', ROUTE_HOME)
  }

  // File Previews and Placeholders
  get previews () {
    const { files } = this.state
    const placeholders = Array(this.count).fill(true).map((val, i) => ({i}))
    return files
      .concat(placeholders.filter(({i}) => !files.find(file => file.i === i)))
      .sort(by('i'))
  }

  get count () {
    return this.props.count || 9
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (!isEqual(this.props.value, nextProps.value)) this.update(nextProps)
  }

  // Validate Uploaded Files & Update Internal State
  handleChange = (files, index) => {
    const indexBy = {}
    files.forEach((file, i) => {
      const position = index + i
      indexBy[position] = true
      file.i = position // cannot destruct object to preserve File object
      file.src = file.preview // this will mutate redux state, but it does not matter since we are only adding fields
    })
    this.updateFiles(this.state.files.filter(file => !indexBy[file.i]).concat(files), files)
  }

  // Remove file from State
  handleRemove = (file, event) => {
    event.stopPropagation() // disable onClick for Dropzone
    const files = this.state.files.filter(({src}) => file.src !== src) // name may not be unique, using URI
    this.props.actions.remove(file, () => this.updateFiles(files, [{remove: true, i: file.i}]))
  }

  // Sync internal state with props
  update = ({value = []} = this.props) => {
    this.setState({files: value})
  }

  // Update Internal State
  updateFiles = (files, changedFiles) => {
    const {onChange} = this.props
    files.sort(by('i'))
    if (files.length > this.count) files.length = this.count
    this.setState({ files })
    if (onChange) {
      changedFiles.forEach(file => this.changedValues[file.i] = {i: file.i, remove: file.remove, src: file.src, file})
      onChange(Object.values(this.changedValues))
    }
  }

  render () {
    const {className, value: _, onChange: __, actions: ___, ...props} = this.props
    return (
      <Row fill className={classNames('app__upload--grid', className)} {...props}>
        {this.previews.map((file, i) => (
          <View
            key={file.src || i}
            className={classNames('app__upload--grid__item', {preview: !!file.src})}>
            <UploadImage
              multiple
              hasPreview={false}
              onUpload={(files) => this.handleChange(files, i)}
            >
              {file.src
                ? (
                  <View className='app__upload__file'
                        style={{backgroundImage: `url('${encodeURI(file.src)}')`}}>
                    <Text className='app__upload__file__number'>{i + 1}</Text>
                    <Icon
                      onClick={(event) => this.handleRemove(file, event)}
                      name='cross-circle'
                      className='app__upload__file__remove larger'
                    />
                  </View>
                )
                : (<Fragment>
                  <Text className='app__upload__file__number large'>{i + 1}</Text>
                  <Icon className='app__upload__file__add large' name='plus-circle'/>
                </Fragment>)
              }
            </UploadImage>
          </View>
        ))}
      </Row>
    )
  }
}
