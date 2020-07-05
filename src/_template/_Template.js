import { connect, stateAction } from 'modules-pack/redux'
import React, { Component } from 'react'
import Button from 'react-ui-pack/Button'
import Icon from 'react-ui-pack/Icon'
import Row from 'react-ui-pack/Row'
import Text from 'react-ui-pack/Text'
import View from 'react-ui-pack/View'
import { logRender, SET } from 'utils-pack'
import { NAME as _TEMPLATE } from './constants'
import select from './selectors'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  isLoading: select.isLoading(state)
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    set: (payload) => dispatch(stateAction(_TEMPLATE, SET, payload))
  }
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps, mapDispatchToProps)
@logRender
export default class _Template extends Component {
  render () {
    const {actions, isLoading} = this.props
    return (
      <View className='app__name'>
        <Row>
          <Button onClick={actions.set}><Icon name='search'/>{isLoading}</Button>
          <Text>{_TEMPLATE}</Text>
        </Row>
      </View>
    )
  }
}
