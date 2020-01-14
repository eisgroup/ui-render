import React, { Component } from 'react'
import { logRender } from '../../common/utils'
import ScrollView from '../../components/ScrollView'
import { reduxForm } from '../../modules/form'
import meta from './data/_meta'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@reduxForm({form: 'TEST', enableReinitialize: true})
@logRender
export default class OpenL extends Component {
  render () {
    console.warn('meta', meta)
    return (
      <ScrollView fill className='fade-in'>
        {'OpenL Tablets'}
      </ScrollView>
    )
  }
}
