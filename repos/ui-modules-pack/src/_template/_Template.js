import { connect, stateAction } from 'ui-modules-pack/redux'
import React, { Component } from 'react'
import Button from 'ui-react-pack/Button'
import Icon from 'ui-react-pack/Icon'
import Row from 'ui-react-pack/Row'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { SET } from 'ui-utils-pack'
import { _TEMPLATE } from './constants'
import select from './selectors'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  loading: select.loading(state)
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
export default class _Template extends Component {
  render () {
    const {actions, loading} = this.props
    return (
      <View className='app__name'>
        <Row>
          <Button onClick={actions.set}><Icon name='search'/>{loading}</Button>
          <Text>{_TEMPLATE}</Text>
        </Row>
      </View>
    )
  }
}
