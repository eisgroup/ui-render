import classNames from 'classnames'
import { NAME as POPUP, POPUP_ALERT, POPUP_CONFIRM } from 'modules-pack/popup/constants'
import { connect, stateAction } from 'modules-pack/redux'
import { ROUTE_HOME } from 'modules-pack/variables'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import Icon from 'react-ui-pack/Icon'
import Loading from 'react-ui-pack/Loading'
import Row from 'react-ui-pack/Row'
import Square from 'react-ui-pack/Square'
import Text from 'react-ui-pack/Text'
import { cssBgImageFrom } from 'react-ui-pack/utils'
import View from 'react-ui-pack/View'
import { by, get, isEqual, OPEN } from 'utils-pack'
import { _ } from 'utils-pack/translations'
import UploadImage from './UploadImage'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapDispatchToProps = (dispatch) => ({
  actions: {
    alert: ({file, aspectRatios}) => dispatch(stateAction(POPUP, OPEN, {
      activePopup: POPUP_ALERT,
      [POPUP_ALERT]: {
        items: [{
          title: _.INVALID_ASPECT_RATIO,
          content: <Row className='center wrap'>
            <Text className='bold margin-h-smaller'>{file.name}'s</Text>
            <Text>{_.DIMENSION_MUST_BE_ONE_OF} </Text>
            <Text className='bold margin-h-smaller'>{aspectRatios.join(', ')}</Text>
          </Row>,
          closeLabel: _.OK
        }]
      }
    })),
    remove: (file, callback) => dispatch(stateAction(POPUP, OPEN, {
      activePopup: POPUP_CONFIRM,
      [POPUP_CONFIRM]: {
        items: [{
          content: `${_.ARE_YOU_SURE_YOU_WANT_TO_REMOVE} ${file.name}?`,
          confirmLabel: _.REMOVE,
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
 *    - @todo - UploadGridField initializes twice on file change, showing old files while loading
 *      (first init uses the very first initialValues - related to Apollo useQuery when using fetchPolicy 'no-cache')
 * -----------------------------------------------------------------------------
 */
@connect(null, mapDispatchToProps)
export default class UploadGrid extends Component {
  static propTypes = {
    initialValues: PropTypes.arrayOf(PropTypes.shape({ // list of Dropzone file objects
      i: PropTypes.number.isRequired, // file position in the grid
      src: PropTypes.string, // file source URL or base64 encoded string
      name: PropTypes.string,
    })).isRequired,
    onChangeLast: PropTypes.func, // callback when files change, receives list of last changed files as argument
    onChange: PropTypes.func, // callback when files change, receives list of all changed files since initialization
    count: PropTypes.number, // number of files that can be uploaded, default is 9
    square: PropTypes.bool, // whether to render as square
    id: PropTypes.string, // Upload file type, falls back to Route pathname, and default is 'images'
    loading: PropTypes.bool,
    // @Note: see Upload module for other props (src/web/modules/upload/_View.js)
  }

  static defaultProps = {
    count: 1
  }

  // Internal state synced with props for rendering temporary UI changes and keeping track of current files
  state = {
    files: this.props.initialValues || []
  }

  // @Note: for file uploads, we don't want to resubmit unchanged files, thus only changed values need to be tracked.
  // `onChange` should receive only changed files in state, not like typical redux-form pattern (all files).
  // Because files may be uploaded/removed without submission, redux-form state value is used
  // is track changed values to send to backend once submitted.
  // If the form is re-initialized, then changed values should be reset
  changedValues = {}

  get id () {
    return this.props.id || this.uri.split(/\//).pop().toLowerCase() || 'images'
  }

  get uri () {
    return get(this.props, 'location.pathname', ROUTE_HOME)
  }

  // File Previews and Placeholders
  get previews () {
    const {count} = this.props
    const {files} = this.state
    const placeholders = Array(count).fill(true).map((_, i) => ({i})).filter(({i}) => !files.find(f => f.i === i))
    return files.concat(placeholders).sort(by('i'))
  }

  get count () {
    return this.props.count || 9
  }

  UNSAFE_componentWillReceiveProps (nextProps, _) {
    if (!isEqual(this.props.initialValues, nextProps.initialValues)) {
      this.changedValues = {}
      this.update(nextProps)
    }
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
    this.updateFiles(
      this.state.files.filter(file => !indexBy[file.i]).concat(files),
      files.map(file => ({i: file.i, file}))
    )
  }

  // Remove file from State
  handleRemove = (file, event) => {
    event.stopPropagation() // disable onClick for Dropzone
    const files = this.state.files.filter(({src}) => file.src !== src) // name may not be unique, using URI
    this.props.actions.remove(file, () => this.updateFiles(files, [{i: file.i, remove: true}]))
  }

  // Sync internal state with props
  update = ({initialValues = []} = this.props) => {
    this.setState({files: initialValues})
  }

  /**
   * Update Internal State
   *
   * @param {Array} files - all files in state
   * @param {Array<Object<i, remove, file>>} changedFiles - list of changed files meta date
   */
  updateFiles = (files, changedFiles) => {
    const {onChange, onChangeLast, count} = this.props
    files.sort(by('i'))
    this.setState({files: files.filter(f => f.i < count)})
    if (onChange) {
      changedFiles.forEach(file => this.changedValues[file.i] = file)
      onChange(Object.values(this.changedValues))
    }
    if (onChangeLast) onChangeLast(changedFiles)
  }

  render () {
    const {loading, square, className, style} = this.props
    const Grid = square ? Square.Row : Row
    return (
      <Grid fill className={classNames('app__upload--grid', className)} style={style}>
        {this.previews.map((file, i) => (
          <View
            key={file.src || i}
            className={classNames('app__upload--grid__item', {preview: !!file.src})}>
            <UploadImage
              multiple
              hasPreview={false}
              showTypes={!file.src}
              onUpload={(files) => this.handleChange(files, i)}
            >
              {file.src
                ? (
                  <View className='app__upload__file' style={{backgroundImage: cssBgImageFrom(file)}}>
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
        <Loading isLoading={loading} classNameChild='round padding bg-neutral'>{`${_.UPDATING}...`}</Loading>
      </Grid>
    )
  }
}
