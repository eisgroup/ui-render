import { fetch } from 'modules-pack/api'
import { popupAlert } from 'modules-pack/popup'
import { FIELD } from 'modules-pack/variables'
import React, { Component } from 'react'
import { cn } from 'react-ui-pack'
import Placeholder from 'react-ui-pack/Placeholder'
import ScrollView from 'react-ui-pack/ScrollView'
import Spinner from 'react-ui-pack/Spinner'
import Text from 'react-ui-pack/Text'
import Render from 'ui-renderer'
import { ENV, fromJSON, get, isEmpty, isFunction, isString, logRender, SUCCESS } from 'utils-pack'
import { withUISetup } from './rules'

let urlPrefix = document.getElementById('react-app').getAttribute('data-prefix-url') || ''
if (urlPrefix) urlPrefix = window.location.origin + urlPrefix
const DATA_URL = urlPrefix + ENV.REACT_APP_DATA_URL
const META_URL = urlPrefix + ENV.REACT_APP_META_URL
FIELD.ACTION = {
  UPDATE: 'update',
}

// noinspection JSConstantReassignment
/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * todo:
 *  - readonly for classic to disable all inputs (defined in data.json root)
 *  - move cross inside input
 * -----------------------------------------------------------------------------
 */
export default class WebStudioPage extends Component {
  state = {
    loadingData: true,
    loadingMeta: true,
  }

  get id () {
    return get(this.props, 'match.params.id') || ((typeof document !== 'undefined' && document.id) || '')
  }

  componentDidMount () {
    /* Use local variables, if set */
    if (typeof window !== 'undefined') {
      const {dataJson, metaJson} = window
      if (dataJson && metaJson) {
        return this.update(dataJson, metaJson)
      } else if (isFunction(window.POST)) {
        FIELD.FUNC[FIELD.ACTION.UPDATE] = this.POST = window.POST
        if (!window.UPDATE) window.UPDATE = this.update
        return window.POST().then(({data, meta}) => this.update(data, meta)).catch(this.popup)
      }
    }

    /* Fetch JSON from external API */
    this.fetch(DATA_URL, {body: this.id, contentType: 'text/plain'})
      .then(data => this.setState({loadingData: false, data}))
      .catch(this.popup)
    this.fetch(META_URL, {contentType: 'application/json'})
      .then(meta => this.setState({loadingMeta: false, meta}))
      .catch(this.popup)
  }

  update = (dataJson, metaJson = null) => {
    const state = {loadingData: false, loadingMeta: false}
    state.data = isString(dataJson) ? fromJSON(dataJson) : dataJson
    if (metaJson) state.meta = isString(metaJson) ? fromJSON(metaJson) : metaJson
    return this.setState(state)
  }

  fetch = async (url, {body = {}, contentType = 'application/json'}) => {
    const data = {method: 'POST', body, headers: {'Content-Type': contentType}}
    const {payload, meta: {result} = {}} = await fetch(url, data)
    if (result === SUCCESS) return payload
    if (result != null) throw Error(result)
  }

  popup = (error) => popupAlert('Fetch Error', <Text>{String(error)}</Text>)

  submit = (formValues) => {
    if (this.POST) return this.POST(formValues).then(({data, meta}) => this.update(data, meta)).catch(this.popup)
    console.warn(formValues)
  }

  render () {
    const {loadingData, loadingMeta, data, meta} = this.state
    this.hasData = !isEmpty(data)
    this.hasMeta = !isEmpty(meta)
    return (this.hasData && this.hasMeta
        ? <WebStudio data={data} meta={meta} initialValues={data} onSubmit={this.submit}/>
        : <Placeholder>
          {!this.hasData &&
          <Text className={cn('h1', {error: !loadingData, blink: loadingData})}>
            {loadingData ? <Text><Spinner size='large'/> Loading...</Text> : 'Missing'} *_data.json
          </Text>
          }
          {!this.hasMeta &&
          <Text className={cn('h1', {error: !loadingMeta, blink: loadingMeta})}>
            {loadingMeta ? <Text><Spinner size='large'/> Loading...</Text> : 'Missing'} *_meta.json
          </Text>
          }
        </Placeholder>
    )
  }
}

@withUISetup({subscription: {pristine: true, valid: true}})
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
    const {form, handleSubmit} = this.props
    return (
      <ScrollView fill className='fade-in bg-neutral'>
        <form onSubmit={handleSubmit}>
          {this.hasData && this.hasMeta && <Render data={this.data} {...this.meta} form={form}/>}
        </form>
      </ScrollView>
    )
  }
}
