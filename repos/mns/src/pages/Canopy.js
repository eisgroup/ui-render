import UIRender from 'core/src/pages/main/rules'
import { fetch } from 'ui-modules-pack/api'
import React, { PureComponent } from 'react'
import { cloneDeep, get, set, SUCCESS, warn } from 'ui-utils-pack'
// import _data from '../examples/canopy/canopy_data'
import initialData from '../examples/canopy/canopy_data.json'
import meta from '../examples/canopy/canopy_meta'

// const body = cloneDeep(data)
// data.request.policy = {
//   ..._data.Policy,
//   ...data.request.policy,
// }

// const URL = 'http://openldemo.exigengroup.com:8080/webservice/gtl-rating-rs/Calculate'
const URL = 'https://openldemo.exigengroup.com/webservice/gip-rating-rs/DeterminePolicyRatesAndPremiums'
// const URL = 'https://openl-rating-app-nightly.genci0.eisgroup.com/gdn-rating-rs/DeterminePolicyRatesAndPremiums'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 */
export default class Earth extends PureComponent {
  state = {
    data: initialData,
  }

  request = async (data, url = URL) => {
    // console.log(data)

    const options = {
      method: 'POST',
      body: data.request.policy,
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      }
    }
    const {payload, meta: {result} = {}} = await fetch(url, options)
    if (result === SUCCESS) return payload
    if (result != null) throw Error(result)
  }

  onSubmit = (data) => {
    console.warn({data})
    this.request(data)
      .then(r => {
        const data = {
          Response: r,
          ...initialData
        }
        this.setState({data})
      })
      .catch(warn)
  }

  render () {
    const {data} = this.state
    return (
      <UIRender
        className="bg-gradient"
        initialValues={data}
        data={data}
        meta={meta}
        onSubmit={this.onSubmit}
      />
    )
  }
}
