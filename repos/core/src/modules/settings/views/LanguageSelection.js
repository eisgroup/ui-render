import classNames from 'classnames'
import React, { Component } from 'react'
import { connect } from '../../../common/redux'
import { LANGUAGE_OPTIONS } from '../../../common/variables'
import Dropdown from '../../../components/Dropdown'
import { languageDropdownOptions } from '../../../components/renders'
import Row from '../../../components/Row'
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
    options: languageDropdownOptions(LANGUAGE_OPTIONS, {selection: true})
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
