import { apiAction } from 'ui-modules-pack/api'
import { POPUP } from 'ui-modules-pack/exports'
import { withForm } from 'ui-modules-pack/form'
import { SliderField } from 'ui-modules-pack/form/inputs'
import { testPayload } from 'ui-modules-pack/popup/data'
import { connect, stateAction } from 'ui-modules-pack/redux'
import { openModal } from 'ui-modules-pack/router/actions'
import { history } from 'ui-modules-pack/router/browser'
import LanguageSelection from 'ui-modules-pack/settings/views/LanguageSelection'
import React, { Component } from 'react'
import Button from 'ui-react-pack/Button'
import Collapse from 'ui-react-pack/Collapse'
import Icon from 'ui-react-pack/Icon'
import Dates from 'ui-react-pack/inputs/Dates'
import ProgressSteps from 'ui-react-pack/ProgressSteps'
import ScrollView from 'ui-react-pack/ScrollView'
import Slider from 'ui-react-pack/Slider'
import Space from 'ui-react-pack/Space'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { ALERT, CREATE, warn, } from 'ui-utils-pack'
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
@withForm()
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
