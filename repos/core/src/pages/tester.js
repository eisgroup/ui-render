import { apiAction } from 'modules-pack/api'
import { POPUP } from 'modules-pack/exports'
import { reduxForm } from 'modules-pack/form'
import { SliderField } from 'modules-pack/form/inputs'
import { testPayload } from 'modules-pack/popup/data'
import { connect, stateAction } from 'modules-pack/redux'
import { history } from 'modules-pack/router'
import { openModal } from 'modules-pack/router/history'
import LanguageSelection from 'modules-pack/settings/views/LanguageSelection'
import React, { Component } from 'react'
import Button from 'react-ui-pack/Button'
import Collapse from 'react-ui-pack/Collapse'
import Icon from 'react-ui-pack/Icon'
import Dates from 'react-ui-pack/inputs/Dates'
import ProgressSteps from 'react-ui-pack/ProgressSteps'
import ScrollView from 'react-ui-pack/ScrollView'
import Slider from 'react-ui-pack/Slider'
import Space from 'react-ui-pack/Space'
import Text from 'react-ui-pack/Text'
import View from 'react-ui-pack/View'
import { ALERT, CREATE, logRender, warn, } from 'utils-pack'
import { API_GQL_URL, ROUTE } from '../common/variables'

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
    getData: () => dispatch(apiAction('http://mnsopenl.exigengroup.com:9998/std-rating-report/ExtractRatingDetails',
      CREATE, {body: ''}, {headers: {'Content-Type': 'application/json'}, callRequest: true}
    )),
    post: () => dispatch(apiAction('http://mnsopenl.exigengroup.com:9998/ui-config/GeneratePageStructure',
      CREATE, {body: ''}, {headers: {'Content-Type': 'application/json'}, callRequest: true}
    )),
    login: () => history.push({pathname: ROUTE.LOGIN, state: {isModal: true}}),
    contact: () => openModal(ROUTE.CONTACT),
    openInModal: () => openModal(ROUTE.THEME),
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
      <ScrollView fill className='app__page padding'>
        <h1>Tester</h1>
        <LanguageSelection/>
        <ProgressSteps defaultIndex={1} classNameSteps='padding-h-largest' items={
          [
            {label: 'Information', content: 'Step 1 content'},
            {label: 'Requirements', done: true, content: 'Step 2 content'},
            {label: 'Submission', error: true},
            {step: '?'},
          ]
        }/>
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
          <Button className='margin primary basic' onClick={actions.getData}>GET DATA</Button>
          <Button className='margin primary basic' onClick={actions.post}>POST Request</Button>
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
      </ScrollView>
    )
  }

  render () {
    return (
      <ScrollView fill className='fade-in'>{this.renderTester()}</ScrollView>
    )
  }
}
