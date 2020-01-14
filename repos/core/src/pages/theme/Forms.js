import React, { Component } from 'react'
import { PATH_IMAGES } from '../../common/variables'
import Checkbox from '../../components/Checkbox'
import Input from '../../components/Input'
import InputNative from '../../components/InputNative'
import Row from '../../components/Row'
import Select from '../../components/Select'
import Tooltip from '../../components/Tooltip'
import View from '../../components/View'
import { reduxForm } from '../../modules/form'
import { InputField, ToggleField } from '../../modules/form/fields'
import { number } from '../../modules/form/normalizers'
import { url } from '../../modules/form/validationRules'

/**
 * Form Inputs
 */
@reduxForm({form: 'TEST', enableReinitialize: true})
export default class Forms extends Component {
  render () {
    return (
      <View className='full-width'>

        <Row className='center wrap'>

          {/* Redux Form Inputs */}
          <Row className='center wrap margin'>
            <form className='app__form max-width-290 padding-h-small'>
              <InputField float name='card' label='Card Number' placeholder='xxxx xxxx xxxx xxxx' icon='visa'
                          done={false}/>
              <Row className='justify'>
                <InputField float name='date' label='Expiry Date' placeholder='mm/yy' stickyPlaceholder done={false}/>
                <InputField float name='cvv' placeholder='xxx' stickyPlaceholder done={false} style={{ width: '45%' }}/>
              </Row>
              <InputField float name='amount' type='number' unit='USD' icon='dollar' left done={false}
                          normalize={number({ min: 0, max: 999999 })}/>
              <InputField float name='target' label='Number with Icon' type='number' icon='dollar' left
                          normalize={number({ min: 0 })}/>
              <Row className='justify'>
                <InputField float name='begin' placeholder='hh:mm' icon='clock' stickyPlaceholder>
                  <Tooltip top>Begin Time</Tooltip>
                </InputField>
                <InputField float name='finish' placeholder='hh:mm' icon='clock' stickyPlaceholder>
                  <Tooltip top>Finish Time</Tooltip>
                </InputField>
              </Row>
            </form>
            <form className='app__form max-width-290 padding-h-small'>
              <InputField float name='url' type='url' placeholder='https://example.com' icon='chain' validate={url}/>
              <InputField float name='amount' type='number' unit='USD' done={false}/>
              <InputField float name='amount' type='number' unit='USD' icon='dollar' done={false}/>
              <InputField name='amount' type='number' unit='USD' icon='dollar' label='Amount' left done={false}/>
              <InputField name='amount' value='9' type='number' unit='USD' icon='dollar' label='Amount'/>
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
              { text: 'English', value: 'en', content: <img src={PATH_IMAGES + 'flags/en.svg'} alt='en'/> },
              { text: 'Русский', value: 'ru', content: <img src={PATH_IMAGES + 'flags/ru.svg'} alt='ru'/> },
            ]}
          />
          <InputNative type='textarea' rows={3} placeholder='Text area...'/>
        </Row>

        {/* Raw Inputs */}
        <Row className='top center wrap margin'>
          <Input label='Label' placeholder='Enter text' icon='dollar' left/>
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
