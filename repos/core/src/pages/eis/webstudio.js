import classNames from 'classnames'
import React, { Component } from 'react'
import { SUCCESS } from '../../common/constants'
import fetch from '../../common/fetch'
import { get, isEmpty, logRender } from '../../common/utils'
import Placeholder from '../../components/Placeholder'
import ScrollView from '../../components/ScrollView'
import Spinner from '../../components/Spinner'
import Text from '../../components/Text'
import Render from '../../components/views/Render'
import { popupAlert } from '../../modules/popup'
import { withUISetup } from './rules'

const DATA_URL = 'http://mnsopenl.exigengroup.com:9998/std-rating-report/ExtractRatingDetails'
const META_URL = 'http://mnsopenl.exigengroup.com:9998/ui-config/GeneratePageStructure'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default class WebStudioPage extends Component {
  state = {
    loadingData: true,
    loadingMeta: true,
  }

  get id () {
    return get(this.props, 'match.params.id')
  }

  componentDidMount () {
    this.fetch(DATA_URL, {body: this.id, contentType: 'text/plain'})
      .then(data => this.setState({loadingData: false, data}))
      .catch(this.popup)
    this.fetch(META_URL, {contentType: 'application/json'})
      .then(meta => this.setState({loadingMeta: false, meta}))
      .catch(this.popup)
  }

  fetch = async (url, {body = {}, contentType = 'application/json'}) => {
    const data = {method: 'POST', body, headers: {'Content-Type': contentType}}
    const {payload, meta: {result} = {}} = await fetch(url, data)
    if (result === SUCCESS) return payload
    if (result != null) throw Error(result)
  }

  popup = (error) => popupAlert('Fetch Error', <Text>{String(error)}</Text>)

  render () {
    const {loadingData, loadingMeta, data, meta} = this.state
    this.hasData = !isEmpty(data)
    this.hasMeta = !isEmpty(meta)
    return (this.hasData && this.hasMeta
        ? <WebStudio data={data} meta={meta} initialValues={data}/>
        : <Placeholder>
          {!this.hasData &&
          <Text className={classNames('h1', {error: !loadingData, blink: loadingData})}>
            {loadingData ? <Text><Spinner size='large'/> Loading...</Text> : 'Missing'} *_data.json
          </Text>
          }
          {!this.hasMeta &&
          <Text className={classNames('h1', {error: !loadingMeta, blink: loadingMeta})}>
            {loadingMeta ? <Text><Spinner size='large'/> Loading...</Text> : 'Missing'} *_meta.json
          </Text>
          }
        </Placeholder>
    )
  }
}

@withUISetup({form: 'WebStudio'})
@logRender
export class WebStudio extends Component {
  state = {
    data: {
      json: this.props.data
    },
    meta: {
      json: this.props.meta
    }
  }

  render () {
    return (
      <ScrollView fill className='fade-in bg-neutral'>
        <form onSubmit={this.handleSubmit}>
          {this.hasData && this.hasMeta && <Render data={this.data} {...this.meta}/>}
        </form>
      </ScrollView>
    )
  }
}
