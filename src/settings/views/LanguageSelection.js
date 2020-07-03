import classNames from 'classnames'
import React, { Component } from 'react'
import { languageDropdownOptions } from 'react-ui-pack'
import Dropdown from 'react-ui-pack/Dropdown'
import Row from 'react-ui-pack/Row'
import { connect } from '../../redux'
import { configs } from '../../variables'
import { setSettings } from '../actions'
import select from '../selectors'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  lang: select.language(state)
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps)
export default class LanguageSelection extends Component {
  static defaultProps = {
    options: languageDropdownOptions(configs.LANGUAGE_OPTIONS, {selection: true})
  }

  state = {
    compact: true,
  }

  handleSetLang = (language) => {
    setSettings({language})
  }

  handleClose = () => {
    if (!this.state.compact) this.setState({compact: true})
  }

  handleOpen = () => {
    if (this.state.compact) this.setState({compact: false})
  }

  render () {
    const {lang, options, className, style, dispatch: _, ...props} = this.props
    const {compact} = this.state
    return <Row className={classNames('fill-width', className)} style={style}>
      <Dropdown
        compact={compact}
        onOpen={this.handleOpen}
        onClose={this.handleClose}
        value={lang}
        options={options.items}
        onChange={this.handleSetLang}
        {...props}
      />
    </Row>
  }
}
