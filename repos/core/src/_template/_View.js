import React, { Component } from 'react'
import { stateAction } from '../common/actions'
import { SET } from '../common/constants'
import { connect } from '../common/redux'
import { logRender } from '../common/utils'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Row from '../components/Row'
import Text from '../components/Text'
import View from '../components/View'
import { NAME } from './constants'
import select from './selectors'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  ui: select.ui(state)
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
export default class NameView extends Component {
  render () {
    const {actions, ui} = this.props
    return (
      <View className='app__name'>
        <Row>
          <Button onClick={actions.set}><Icon name='search' />{ui.isLoading}</Button>
          <Text>{NAME}</Text>
        </Row>
      </View>
    )
  }
}
