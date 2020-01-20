import React, { Component } from 'react'
import { ALERT, CREATE, stateAction } from '../common/actions'
import { apiAction } from '../common/api/actions'
import { connect } from '../common/redux'
import { logRender, warn } from '../common/utils'
import { API_GQL_URL, ROUTE } from '../common/variables'
import Button from '../components/Button'
import Collapse from '../components/Collapse'
import Icon from '../components/Icon'
import Dates from '../components/inputs/Dates'
import ScrollView from '../components/ScrollView'
import Slider from '../components/Slider'
import Space from '../components/Space'
import Text from '../components/Text'
import View from '../components/View'
import { POPUP } from '../modules/exports'
import { reduxForm } from '../modules/form'
import { SliderField } from '../modules/form/inputs'
import { testPayload } from '../modules/popup/data'
import { history } from '../modules/router'

const query = `mutation {
  login (email: "example@gmail.com", password: "TEST!@#$%") {
    id
    email
  }
}`

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = () => ({
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    mutate: () => dispatch(apiAction(API_GQL_URL, CREATE, {body: {query}}, {
      query,
      headers: {'Content-Type': 'application/json'}
    })),
    login: () => history.push({pathname: ROUTE.LOGIN, state: {isModal: true}}),
    contact: () => history.push({ pathname: ROUTE.CONTACT, state: { isModal: true } }),
    openInModal: () => history.push({ pathname: ROUTE.THEME, state: { isModal: true } }),
    popupAlert: () => dispatch(stateAction(POPUP, ALERT, testPayload)),
  }
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps, mapDispatchToProps)
@reduxForm({form: 'TEST', enableReinitialize: true})
@logRender
export default class Tester extends Component {
  renderTester = () => {
    const { actions } = this.props
    return (
      <View fill className='app__page wrap padding'>
        <h1>Tester</h1>
        <View className='max-width-320'>
          <Slider step={1} min={1} max={100} onChange={console.warn} defaultValue={30}/>
          <Space/>
          <SliderField name='slider' step={1} min={1} max={100} onChange={console.warn} defaultValue={30}/>
        </View>
        <Space/>
        <SliderField name='slider2' step={1} min={1} max={100} onChange={console.warn} defaultValue={30}/>
        <Dates onChange={warn}/>

        <View className='center wrap margin-top-largest border-top fill-width'>
          <Button className='margin primary basic' onClick={actions.login}>Login Modal</Button>
          <Button className='margin primary basic' onClick={actions.mutate}>GraphQL Mutation</Button>
          <Button className='margin secondary basic' onClick={actions.contact}>Contact</Button>
          <Button className='margin primary basic' onClick={actions.openInModal}>Open in Modal</Button>
          <Button className='margin secondary basic' onClick={actions.popupAlert}>Popup Alert</Button>
        </View>

        {/* Misc */}
        <Collapse
          toggleRender={isOpen => <Icon className='padding' name={isOpen ? 'minus' : 'plus'}/>}
          contentOpened={<Text>Expanded content</Text>}
          contentClosed={<Text>Collapsed content</Text>}
        />
        <Collapse
          horizontal
          toggleRender={isOpen => <Icon className='padding' name={isOpen ? 'minus' : 'plus'}/>}
          contentRender={isOpen => isOpen && <Text>Shown content</Text>}
        />
      </View>
    )
  }

  render () {
    return (
      <ScrollView fill className='fade-in'>{this.renderTester()}</ScrollView>
    )
  }
}
