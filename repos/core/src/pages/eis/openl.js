import React, { Component } from 'react'
import { logRender } from '../../common/utils'
import ScrollView from '../../components/ScrollView'
import Render from '../../components/views/Render'
import { reduxForm } from '../../modules/form'
import data from './data/_data'
import meta from './data/_meta'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@reduxForm({form: 'TEST', enableReinitialize: true})
@logRender
export default class OpenL extends Component {
  static defaultProps = {
    data,
    meta,
  }

  render () {
    const {data, meta} = this.props
    return (
      <ScrollView fill className='fade-in'>
        <Render {...meta}/>
      </ScrollView>
    )
  }
}
