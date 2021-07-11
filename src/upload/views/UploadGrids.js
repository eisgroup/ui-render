import classNames from 'classnames'
import React, { Component } from 'react'
import { type } from 'react-ui-pack'
import Label from 'react-ui-pack/Label'
import Tabs from 'react-ui-pack/Tabs'
import View from 'react-ui-pack/View'
import { isEqual } from 'utils-pack'
import UploadGrid from './UploadGrid'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Wrapper for <UploadGrid/> with different `kinds` of files as separate Tabs
 * @see: UploadGrid.js for reference
 * -----------------------------------------------------------------------------
 */

export default class UploadGrids extends Component {
  static propTypes = {
    // Types of file uploads (example: public, private...)
    kinds: type.ListOf(type.Of({
      _: type.Any.isRequired, // identifier code that is language agnostic
      name: type.GetterString.isRequired, // localised label for the kind
      types: type.ListOf(type.Definition), // localised labels for file types of the kind
    }).isRequired).isRequired,
    // other <UploadGrid/> ...props to be passed down (only one kind of UploadGrid is rendered at any time)
  }

  static defaultProps = {
    initialValues: [], // flat list of all File kinds and types
  }

  state = {
    files: this.props.initialValues // maintain state for uploads when tabs change
  }

  changedValues = {}

  UNSAFE_componentWillReceiveProps (nextProps, _) {
    if (!isEqual(this.props.initialValues, nextProps.initialValues)) {
      this.changedValues = {}
      this.setState({files: nextProps.initialValues})
    }
  }

  handleChange = (changedFiles) => {
    const {onChange, onChangeLast} = this.props
    let {files} = this.state
    changedFiles.forEach(file => {
      const {kind, i} = file
      this.changedValues[`${kind}_${i}`] = file // store session changes
      if (file.remove) { // remove from state if deleted
        files = files.filter(f => f.i !== file.i || f.kind !== file.kind)
      } else if (!files.find(f => f.i === file.i && f.kind === file.kind)) { // add new file
        files = [...files, file]
      } else { // update existing file
        files = files.map(f => (f.i === file.i && f.kind === file.kind) ? file : f)
      }
    })
    this.setState({files})
    if (onChangeLast) {
      onChangeLast(changedFiles)
    } else if (onChange) {
      onChange(Object.values(this.changedValues))
    }
  }

  render () {
    const {kinds, label, className, style, onChange: _, onChangeLast: __, ...props} = this.props
    const {files} = this.state
    return (
      <View className={classNames('input--wrapper', className)} style={style}>
        {label && <Label>{label}</Label>}
        <Tabs
          centerTabs
          tabs={kinds.map(k => k.name)}
          panels={kinds.map(({_, types}) => () => (
            <UploadGrid
              {...props}
              // key={_} // do not add key to avoid unmounting
              kind={_}
              types={types}
              initialValues={files.filter(f => f.kind === _)}
              onChangeLast={this.handleChange}
            />
          ))}
        />
      </View>
    )
  }
}
