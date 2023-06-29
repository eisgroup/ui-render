import React, { PureComponent } from 'react'
import UIRender from './rules'
import data from './tester/test_data'
import meta from './tester/test_meta'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 */
export default class Tester extends PureComponent {
  render () {
    return (
      <UIRender
        className="bg-info-light"
        initialValues={data}
        data={data}
        meta={meta}
      />
    )
  }
}
