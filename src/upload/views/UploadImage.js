import { connect } from 'modules-pack/redux'
import { FILE } from 'modules-pack/variables'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import Image from 'react-ui-pack/Image'
import { isEqual, toList } from 'utils-pack'
import select from '../selectors'
import Upload from './Upload'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  files: select.images(state)
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Image uploader connected to redux-state for the last uploaded file
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps)
export default class UploadImage extends PureComponent {
  static propTypes = {
    // Upload file type, default is 'images'
    type: PropTypes.string,
    // Show first uploaded image preview, default is true
    hasPreview: PropTypes.bool,
    // list of Dropzone file objects to override default selector
    files: PropTypes.arrayOf(PropTypes.object).isRequired,
    // Allow multiple file uploads, default is false
    multiple: PropTypes.bool,
    // Remove File preview when another uploaded
    autoClean: PropTypes.bool,
    // Placeholder content to render if no preview
    children: PropTypes.any,
    // @Note: see Upload module for other props (src/web/modules/upload/_View.js)
  }

  static defaultProps = {
    type: FILE.TYPE.IMAGE
  }

  get file () {
    const {files} = this.props
    return toList(files)[0] || {}
  }

  UNSAFE_componentWillReceiveProps (nextProps, _) {
    // Prevent memory leak (this clears last uploaded files in redux state, if no `files` prop given)
    const {autoClean, files} = this.props
    if (autoClean && !isEqual(files, nextProps.files)) this.garbageClean()
  }

  componentWillUnmount () {
    this.props.autoClean && this.garbageClean()
  }

  garbageClean = ({files} = this.props) => {
    for (const file of files) {
      if (file.preview) URL.revokeObjectURL(file.preview)
    }
  }

  render () {
    const {hasPreview = true, children, dispatch: _, autoClean: __, ...props} = this.props
    const {preview} = this.file
    return (
      <Upload hasHeader={false} multiple={false} {...props}>
        {(hasPreview && preview) ? <Image name='preview' src={preview}/> : children}
      </Upload>
    )
  }
}
