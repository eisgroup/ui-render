import UIRender from 'core/src/pages/eis/rules'
import { fetch } from 'ui-modules-pack/api'
import React, { PureComponent } from 'react'
import { cloneDeep, get, set, SUCCESS, warn } from 'ui-utils-pack'
import _data from '../examples/earth/earth_data'
import data from '../examples/earth/earth_data.json'
import meta from '../examples/earth/earth_meta'

const body = cloneDeep(data)
data.request.policy = {
  ..._data.Policy,
  ...data.request.policy,
}

// const URL = 'http://openldemo.exigengroup.com:8080/webservice/gtl-rating-rs/Calculate'
const URL = 'https://openldemo.exigengroup.com/webservice/gtl-rating-rs/Calculate'
// const URL = 'https://openl-rating-app-nightly.genci0.eisgroup.com/gdn-rating-rs/DeterminePolicyRatesAndPremiums'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 */
export default class Earth extends PureComponent {
  state = {
    data,
  }

  request = async (data = body, url = URL) => {
    const options = {method: 'POST', body: data, headers: {'Content-Type': 'application/json'}}
    const {payload, meta: {result} = {}} = await fetch(url, options)
    if (result === SUCCESS) return payload
    if (result != null) throw Error(result)
  }

  onSubmit = (data) => {
    console.warn({data})
    this.request(data)
      .then(data => {
        set(data, 'request.policy', {
          ..._data.Policy,
          ...get(data, 'request.policy')
        })
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
