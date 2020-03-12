import React, { Component } from 'react'
import { warn } from '../../common/utils'
import Dropdown from '../../components/Dropdown'
import Place from '../../components/inputs/Place'
import Row from '../../components/Row'
import View from '../../components/View'
import { reduxForm } from '../../modules/form'
import PlaceField from '../../modules/form/renders/PlaceField'
import { isRequired } from '../../modules/form/validationRules'

/**
 * Form Inputs
 */
@reduxForm({form: 'TEST', enableReinitialize: true})
export default class Dropdowns extends Component {
  render () {
    const options = ['Alpha', 'Beta', 'Mega']
    return (
      <View className='full-width'>


        <Row className='full-width center wrap margin'>
          {/* Raw Inputs */}
          <form className='app__form full-width max-width-290 padding-h-small'>
            <Dropdown placeholder='Select' float options={options}/>
            <Dropdown placeholder='Disabled' disabled float options={options}/>
            <Dropdown placeholder='Disabled' label='disabled' value={options[0]} disabled float options={options}/>
            <Dropdown placeholder='Loading...' loading float options={options}/>
          </form>
          {/* Raw Inputs */}
          <form className='app__form full-width max-width-290 padding-h-small'>
            <Dropdown placeholder='Search' search float options={options}/>
            <Dropdown placeholder='Readonly' readonly float options={options}/>
            <Dropdown placeholder='Readonly' label='readonly' value={options[0]} readonly float options={options}/>
            <Dropdown placeholder='Loading...' label='done' value={[1]} loading search float options={[
              {text: '[1]', value: '1'},
              {text: '[2]', value: '2'},
            ]}/>
          </form>

          {/* Redux Form Inputs */}
          <form className='app__form full-width max-width-290 padding-h-small'>
            <PlaceField name='place' placeholder='Enter address' required validate={isRequired}/>
            <Place placeholder='Enter address' onChange={val => warn('onSelect', val)}
              // value={{id: 'ChIJGaSPc1pKtUYRHzFSa1B9NHw', address: 'Red Square, Moskva, Russia, 109012'}}
            />
          </form>
        </Row>
      </View>
    )
  }
}
