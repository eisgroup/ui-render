import { connect, stateAction } from 'ui-modules-pack/redux'
import React, { Component } from 'react'
import Select from 'ui-react-pack/Select'
import View from 'ui-react-pack/View'
import { logRender, SET } from 'ui-utils-pack'
import { DEFAULT } from '../../variables'
import { NAME, SETTING } from '../constants'
import select from '../selectors'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  theme: select.theme(state)
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    set: (payload) => dispatch(stateAction(NAME, SET, payload))
  }
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps, mapDispatchToProps)
@logRender
export default class Settings extends Component {
  handleSetTheme = (theme) => {
    if (typeof theme === 'string' && this.props.theme !== theme) {
      this.props.actions.set({theme})
    }
  }

  render () {
    const {theme = DEFAULT.THEME} = this.props
    return (
      <View className='app__settings padding left'>
        <View className='padding-v-smaller'>
          <Select
            compact selection
            value={theme}
            onChange={this.handleSetTheme}
            options={[
              {text: 'Light UI', value: SETTING.THEME.LIGHT},
              {text: 'Dark UI', value: SETTING.THEME.DARK},
            ]}
          />
        </View>
      </View>
    )
  }
}
