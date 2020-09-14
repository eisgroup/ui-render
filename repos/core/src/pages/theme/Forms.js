import { withForm } from 'modules-pack/form'
import React, { Component } from 'react'
import Checkbox from 'react-ui-pack/Checkbox'
import Input from 'react-ui-pack/Input'
import InputNative from 'react-ui-pack/InputNative'
import Row from 'react-ui-pack/Row'
import Select from 'react-ui-pack/Select'
import Tooltip from 'react-ui-pack/Tooltip'
import View from 'react-ui-pack/View'
import { PATH_IMAGES } from '../../common/variables'
import { DropdownField, InputField, ToggleField } from '../../modules/form/inputs'
import { hourMinute, number } from '../../modules/form/normalizers'
import { isRequired, url } from '../../modules/form/validationRules'

/**
 * Form Inputs
 */
@withForm()
export default class Forms extends Component {
  render () {
    return (
      <View className='full-width'>

        <Row className='center wrap'>

          {/* Redux Form Inputs */}
          <Row className='center wrap margin'>
            <form className='app__form max-width-290 padding-h-small'>
              <InputField float name='card' label='Card Number' placeholder='xxxx xxxx xxxx xxxx' icon='visa'/>
              <Row className='justify'>
                <InputField float name='date' label='Expiry Date' placeholder='mm/yy' stickyPlaceholder/>
                <InputField float name='cvv' placeholder='xxx' stickyPlaceholder style={{width: '45%'}}/>
              </Row>
              <Row className='justify bottom'>
                <InputField name='amount' type='number' unit='USD' icon='dollar' label='Amount' lefty/>
                <InputField float name='amount' type='number' unit='USD' icon='dollar'
                            normalize={number({min: 0, max: 999999})}/>
              </Row>
              <Row className='justify'>
                <InputField float name='begin' icon='clock' placeholder='hh:mm' stickyPlaceholder
                            normalize={hourMinute} onChange={console.warn}>
                  <Tooltip top>Begin Time</Tooltip>
                </InputField>
                <InputField float name='finish' icon='clock' placeholder='hh:mm' stickyPlaceholder
                            normalize={hourMinute}>
                  <Tooltip top>Finish Time</Tooltip>
                </InputField>
              </Row>
              <Row className='justify'>
                <InputField name='check' type='checkbox' label='checkbox' onChange={console.warn}/>
                <InputField name='choice' type='radio' label='radio' onChange={console.warn}/>
              </Row>
            </form>
            <form className='app__form max-width-290 padding-h-small'>
              <InputField float name='url' type='url' placeholder='https://example.com' icon='chain' validate={url}/>
              <Row className='justify'>
                <InputField float name='required' required validate={isRequired}/>
                <DropdownField float name='dropdown-required' options={['One', 'Two', 'Three']} validate={isRequired}/>
              </Row>
              <Row className='justify'>
                <InputField name='done' value={9} type='number' unit='%' label='Done'/>
                <InputField name='false' placeholder='done=false' label='Done' done={false}/>
              </Row>
              <Row className='justify'>
                <InputField float name='disabled' icon='USD' lefty disabled value={7}/>
                <InputField float name='disabled-empty' disabled/>
              </Row>
              <Row className='justify'>
                <InputField float name='info' info='Info Message'/>
                <DropdownField float name='dropdown' info='Info' options={['One', 'Two', 'Three']}/>
              </Row>
              <Row className='justify'>
                <InputField float name='readonly' icon='edit' lefty/>
                <InputField float name='readonly' readonly/>
              </Row>
            </form>
          </Row>
        </Row>

        {/* Raw Inputs */}
        <Row className='top center wrap margin'>
          <Input type='email' placeholder='example@gmail.com' icon='mail'/>
          <Input type='number' placeholder='Number...'/>
          <Input type='date' icon='calendar'/>
          <Select
            options={[
              {text: 'English', value: 'en', content: <img src={PATH_IMAGES + 'flags/en.svg'} alt='en'/>},
              {text: 'Русский', value: 'ru', content: <img src={PATH_IMAGES + 'flags/ru.svg'} alt='ru'/>},
            ]}
          />
          <InputNative type='textarea' rows={3} placeholder='Text area...'/>
        </Row>

        {/* Raw Inputs */}
        <Row className='top center wrap margin'>
          <Input label='Label' placeholder='Enter text' icon='dollar' lefty/>
          <Input type='textarea' label='Text Area' icon='edit'/>
        </Row>

        {/* Toggle Field */}
        <Row className='center wrap margin-large'>
          <ToggleField name='status' labelTrue='Active' labelFalse='Paused'/>
          <ToggleField name='status2' labelTrue='Active' labelFalse='Paused' defaultValue={true}/>
          <Checkbox type='toggle' label='state' labelTrue='Active' labelFalse='Pending' value={false} disabled/>
        </Row>
      </View>
    )
  }
}
