import classNames from 'classnames'
import { POPUP, POPUP_ALERT, POPUP_CONFIRM } from 'modules-pack/popup/constants'
import { connect, stateAction } from 'modules-pack/redux'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { type } from 'react-ui-pack'
import Icon from 'react-ui-pack/Icon'
import Label from 'react-ui-pack/Label'
import Loading from 'react-ui-pack/Loading'
import Row from 'react-ui-pack/Row'
import Square from 'react-ui-pack/Square'
import Text from 'react-ui-pack/Text'
import { cssBgImageFrom } from 'react-ui-pack/utils'
import View from 'react-ui-pack/View'
import { by, isEqual, OPEN, toList } from 'utils-pack'
import { _ } from '../translations'
import Upload from './Upload'

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
 * @requires:
 *    - Popup and Upload modules activated
 * @Note:
 *    - GQL upload mutation with extra meta data should be handled separately, because
 *      it's not related to UploadGrid, which should be a simple array of files without meta data
 *    - @todo - UploadGridField initializes twice on file change, showing old files while loading
 *      (first init uses the very first initialValues - related to Apollo useQuery when using fetchPolicy 'no-cache')
 * -----------------------------------------------------------------------------
 */
@connect(null, mapDispatchToProps)
export default class UploadGrid extends Component {
  static propTypes = {
    /**
     * @Note: `value` is ignored, only `initialValues` are used because if controlled `value` is used,
     *  we won't be able to collect the list of all uploaded/deleted/edited files since previous 'save' submission,
     *  since form input `value` will always be in sync with current component state.
     */
    initialValues: type.OneOf(type.ListOf(type.FileInput), type.FileInput),
    // Callback when files change, receives list of all changed files since initialization
    onChange: PropTypes.func,
    // Callback when files change, receives list of last changed files as argument, will not call `onChange` if given
    onChangeLast: PropTypes.func,
    // Whether to store values as list, even if count = 1, ignored if `count > 1` or `types` are defined
    multiple: type.Boolean,
    // Number of files that can be uploaded, ignored if `types` are defined
    count: PropTypes.number,
    // Explicitly define identifiers for each upload in the grid
    types: type.ListOf(type.Definition.isRequired),
    // Type of file (added to new uploads)
    kind: PropTypes.any,
    // Render grid as square (can be defined as Square props)
    square: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    loading: PropTypes.bool,
    iconUpload: PropTypes.string,
    iconRemove: PropTypes.string,
    label: PropTypes.any,
    placeholder: PropTypes.any,
    // Hooked to each Upload Dropzone for validation
    onBlur: PropTypes.func,
    // Hooked to each Upload Dropzone
    onFocus: PropTypes.func,
    // Remove File previews when unmounted
    autoClean: PropTypes.bool,
    // Show incremental File position count
    showCount: PropTypes.bool,
    // Show File name once uploaded, defaults to count or version type
    showName: PropTypes.bool,
    error: PropTypes.any,
    // info: PropTypes.any, // not yet available because `active` state within Upload is not propagated to UploadGrid
    //                         and it is not visible use-case since choose file window will obscure information.
    // @Note: see Upload.js other props
  }

  static defaultProps = {
    autoClean: true,
    count: 1,
    loading: false,
    iconUpload: 'plus-circle',
    iconRemove: 'cross-circle',
  }

  // Internal state synced with props for rendering temporary UI changes and keeping track of current files
  state = {
    files: toList(this.props.initialValues, 'clean')
  }

  // @Note: for file uploads, we don't want to resubmit unchanged files, thus only changed values need to be tracked.
  // `onChange` should receive only changed files in state, not like typical redux-form pattern (all files).
  // Because files may be uploaded/removed without submission, redux-form state value is used
  // to track changed values to send to backend once submitted.
  // If the form is re-initialized, then changed values should be reset
  changedValues = {}
  // For garbage cleaning previews
  cachedFiles = {}

  // Grid count
  get count () {
    const {types, count} = this.props
    return (types && types.length) || count
  }

  get isIncremental () {
    return !this.props.types || !this.props.types.length
  }

  // File Previews and Placeholders
  get previews () {
    const {types, count, showName} = this.props
    const {files} = this.state
    if (!this.isIncremental) { // explicitly defined identifiers
      // Sort placeholder by identifier types order
      return types.map(v => {
        const file = files.find(f => f.i === v._)
        if (!showName && file) file.name = v.name // show version type, instead of File.name
        return file || {i: v._, name: v.name}
      })
    } else { // sort by incremental count
      const placeholders = Array(count).fill(true).map((_, i) => ({i})).filter(({i}) => !files.find(f => f.i === i))
      // noinspection JSCheckFunctionSignatures
      return files.concat(placeholders).sort(by('i'))
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps, _) {
    if (!isEqual(this.props.initialValues, nextProps.initialValues)) {
      this.changedValues = {}
      this.setState({files: toList(nextProps.initialValues, 'clean')})
    }
  }

  componentWillUnmount () {
    this.props.autoClean && Object.keys(this.cachedFiles).forEach(src => URL.revokeObjectURL(src))
  }

  /**
   * Validate Uploaded Files & Update Internal State
   * @param {Object<preview, name>[]} files - File objects from Dropzone
   * @param {*} i - identifier or index position
   */
  handleChange = (files, i) => {
    const indexBy = {}
    const {kind, showName} = this.props
    const isIncremental = this.isIncremental
    files.forEach((file, index) => { // index here is from Dropzone accepted files list
      const identifier = isIncremental ? i + index : i
      indexBy[identifier] = true
      // Cannot destruct object to preserve File object
      file.i = identifier
      file.kind = kind
      file.src = file.preview // this mutates redux state, but it does not matter since only adding fields
    })
    // noinspection JSUnresolvedVariable
    const filesInput = files.map(file => ({
      i: file.i, kind: file.kind, src: file.src, file,
      ...showName && {name: file.name}
    }))
    this.updateFiles(
      this.state.files.filter(file => !indexBy[file.i]).concat(filesInput),
      filesInput
    )
  }

  // Remove file from State
  handleRemove = (file, event) => {
    event.stopPropagation() // disable onClick for Dropzone
    const files = this.state.files.filter(({i}) => file.i !== i) // name may not be unique, using URI
    this.props.actions.remove(file, () => this.updateFiles(files, [{i: file.i, kind: file.kind, remove: true}]))
  }

  /**
   * Update Internal State
   * @param {Array} files - all files in state of type.FileInput
   * @param {Array<Object<i, remove, file>>} changedFiles - list of changed files of type.FileInput
   */
  updateFiles = (files, changedFiles) => {
    const {onChange, onChangeLast, multiple} = this.props
    const count = this.count
    const isArray = count > 1 || multiple
    changedFiles.forEach(file => {
      const {src, kind, i} = file
      this.cachedFiles[src] = file
      this.changedValues[`${kind}_${i}`] = file
    })
    this.setState({files: this.isIncremental ? files.sort(by('i')).filter(f => f.i < count) : files})
    if (onChangeLast) {
      onChangeLast(isArray ? changedFiles : changedFiles[0])
    } else if (onChange) {
      onChange(isArray ? Object.values(this.changedValues) : changedFiles[0])
    }
  }

  render () {
    const {
      label, loading, placeholder, square, count: _, kind, types, showCount, showName,
      error, info, iconUpload, iconRemove,
      className, style,
      ...props
    } = this.props
    const count = this.count
    const hasCount = showCount && count > 1 && this.isIncremental
    const shouldCount = showCount && !showName && hasCount
    // Render as square by default, if square root of count is a whole number
    // All other cases render as a wrapping Row to let css `upload.less` control the layout
    const squared = square == null ? ((Math.sqrt(count) % 1) === 0) : square
    const Grid = squared ? Square.Row : Row
    return (
      <View className={classNames('input--wrapper', className)} style={style}>
        {label && <Label>{label}</Label>}
        <Grid fill className={classNames(`upload-grid count-${count}`, {error, info, wrap: !squared})} {...square}>
          {this.previews.map((file, i) => (
            <View
              key={file.i || i}
              className={classNames('upload-grid__item', {preview: !!file.src})}>
              <Upload
                {...props}
                multiple={count > 1}
                autoClean={false}
                hasHeader={false}
                showTypes={!file.src}
                onUpload={(files) => this.handleChange(files, file.i)}
              >
                {file.src
                  ? (
                    <View className='upload__file' style={{backgroundImage: cssBgImageFrom(file)}}>
                      <Text className='upload__file__label'>{shouldCount ? (i + 1) : file.name}</Text>
                      <Icon
                        onClick={(event) => this.handleRemove(file, event)}
                        name={iconRemove}
                        className='upload__file__remove larger'
                      />
                    </View>
                  )
                  : (<Fragment>
                    {placeholder && <Text className='upload__file__placeholder'>{placeholder}</Text>}
                    <Text className='upload__file__label'>{hasCount ? (i + 1) : file.name}</Text>
                    <Icon className='upload__file__add large' name={iconUpload}/>
                  </Fragment>)
                }
              </Upload>
            </View>
          ))}
          <Loading loading={loading} classNameChild='round padding bg-neutral'>{`${_.UPDATING}...`}</Loading>
        </Grid>
        {/* Below element is used to trigger error animation because grid may be nested inside square */}
        <View className={classNames('input', {error, info})}/>
        {(error || info) &&
        <View className='field-help'>
          {error && <Text className='error'>{error}</Text>}
          {info && <Text className='into'>{info}</Text>}
        </View>
        }
      </View>
    )
  }
}
