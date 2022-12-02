import UIRender from 'core/src/pages/eis/rules'
import { fetch } from 'ui-modules-pack/api'
import React, { PureComponent } from 'react'
import { cloneDeep, SUCCESS, warn } from 'ui-utils-pack'
import initialData from '../examples/rocket_data'
import meta from '../examples/rocket_meta'
import { downloadHistoricalFileTemplate, updateExperienceData, uploadHistoricalFile } from 'web/api/gdn-rating-alg'
import response from '../examples/rocket_response_mocked'

const body = cloneDeep(initialData)


/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 */
export default class Rocket extends PureComponent {
  state = {
    data: initialData,
  }

  // request = async (data = body, url = 'https://openldemo.exigengroup.com/webservice/gtl-rating-rs/Calculate') => {
  request = async (data = body, url = 'https://openl-rating-app-nightly.genci0.eisgroup.com/gdn-rating-rs/DeterminePolicyRatesAndPremiums') => {
    // const options = {method: 'POST', body: data, headers: {'Content-Type': 'application/json'}}
    // const {payload, meta: {result} = {}} = await fetch(url, options)
    // if (result === SUCCESS) return payload
    // if (result != null) throw Error(result)
    return response;
  }

  onSubmit = (data) => {
    console.warn({data})
    this.request(data)
      .then(response => {
        // set(data, 'request.Policy', {
        //   ..._data.Policy,
        //   ...data
        // })
        // console.log('this.data', this.state)
        const mergedData = {
          response,
          ...this.state.data
        }
        console.log('data before set state', mergedData)
        this.setState({data: mergedData})
      })
      .catch(warn)
  }

  updatePeriods = async ({ ExperienceData, ...rest}) => {
    const response = await updateExperienceData(ExperienceData)
    return { ...rest, ExperienceData: response }
  }

  uploadFile = async (dataJson, file) => {
    const { ExperienceData, ...rest } = JSON.parse(dataJson)
    const response = await uploadHistoricalFile(JSON.stringify(ExperienceData), file)
    return { ...rest, ExperienceData: response }
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
        apiCalls={{
          updateExperienceData: this.updatePeriods,
          downloadFile: downloadHistoricalFileTemplate,
          uploadFile: this.uploadFile
        }}
      />
    )
  }
}
