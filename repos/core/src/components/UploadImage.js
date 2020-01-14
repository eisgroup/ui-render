import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from '../common/redux'
import { isEqual, toList } from '../common/utils'
import upload from '../modules/upload'
import Upload from '../modules/upload/_View'
import Image from './Image'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  files: upload.select.images(state)
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps)
export default class UploadImage extends Component {
  static propTypes = {
    id: PropTypes.string, // Upload file type, default is 'images'
    hasPreview: PropTypes.bool, // whether to show first uploaded image preview, default is true
    files: PropTypes.arrayOf(PropTypes.object), // list of Dropzone file objects to override default selector
    multiple: PropTypes.bool, // whether to allow multiple file uploads, default is false
    children: PropTypes.any, // placeholder content to render if no preview exists
    // @Note: see Upload module for other props (src/web/modules/upload/_View.js)
  }

  get file () {
    const { files } = this.props
    return toList(files)[0] || {}
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    // Prevent memory leak
    const { files } = this.props
    if (isEqual(files, nextProps.files)) return
    for (const file of files) {
      if (file.preview) window.URL.revokeObjectURL(file.preview)
    }
  }

  render () {
    const { hasPreview = true, children, dispatch: _, ...props } = this.props
    const { preview } = this.file
    return (
      <Upload id='images' hasHeader={false} multiple={false} {...props}>
        {(hasPreview && preview) ? <Image name='preview' src={preview}/> : children}
      </Upload>
    )
  }
}
