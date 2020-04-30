import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ALERT, GET, SET, stateAction } from '../../common/actions'
import fetch from '../../common/fetch'
import { connect } from '../../common/redux'
import { cloneDeep, isEmpty, logRender, performStorage, set } from '../../common/utils'
import { _, FIELD, FILE_TYPE } from '../../common/variables'
import Json from '../../components/Json'
import Row from '../../components/Row'
import ScrollView from '../../components/ScrollView'
import Text from '../../components/Text'
import View from '../../components/View'
import Render, { metaToProps } from '../../components/views/Render'
import { settings } from '../../modules'
import { POPUP } from '../../modules/exports'
import { reset } from '../../modules/form'
import { withForm } from '../../modules/form/utils'
import LanguageSelection from '../../modules/settings/views/LanguageSelection'
import Upload from '../../modules/upload/views/Upload'
import { transformConfig } from './rules'

const DEMO_JSON_STORAGE_KEY = 'DEMO_JSON'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  lang: settings.select.language(state), // to trigger re-render
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    popup: ({content, title}) => dispatch(stateAction(POPUP, ALERT, {items: [{title, content}]})),
  }
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps, mapDispatchToProps)
@logRender
export default class Demo extends Component {
  // @Note: functions should have consistent pattern of receiving important arguments first,
  // followed by optional arguments.
  // Positional arguments was chosen instead of keyword arguments because
  // it provides more flexibility and separation of concerns between different configs.
  state = {
    showMeta: true,
    data: (performStorage(GET, DEMO_JSON_STORAGE_KEY) || {}).data || {
      json: undefined,
      name: undefined,
    },
    meta: {
      json: undefined,
      name: undefined,
    },
    active: {
      // plan: 1,
    },
  }

  setStates = (value, keyPath) => {
    return this.setState(set(this.state, keyPath, value))
  }

  resetForm = (...args) => this._resetForm(...args)

  setup = {
    reset: (FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm),
    setState: (FIELD.FUNC[FIELD.ACTION.SET_STATE] = this.setStates),
    fetch: (FIELD.FUNC[FIELD.ACTION.FETCH] = fetch),
  }

  handleUpload = (kind, [file], type) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        let json = JSON.parse(reader.result)
        if (kind === 'meta') json = transformConfig(json)
        this.setState({[kind]: {json, name: file.name}}, () => {
          if (kind === 'data') performStorage(SET, DEMO_JSON_STORAGE_KEY, {[kind]: this.state.data})
        })
      } catch (error) {
        this.props.actions.popup({
          title: `${file.name} is invalid .${type} file`,
          content: <View>
            <Text className='h5'>{_.ERROR_MESSAGE}</Text>
            <Text className='p'>{String(error)}</Text>
          </View>
        })
      }
    }
    reader.readAsText(file)
  }

  render () {
    const {lang} = this.props
    const {data, meta, showMeta} = this.state
    const hasData = !isEmpty(data.json)
    const hasMeta = !isEmpty(meta.json)
    const props = (hasData && hasMeta) ? metaToProps(cloneDeep(meta.json), data.json, this) : null
    const uploadProps = {
      hasHeader: false,
      multiple: false,
      lang,
      id: FILE_TYPE.JSON,
    }
    return (
      <>
        <ScrollView fill className='fade-in bg-neutral min-height-290'>
          {hasData && hasMeta && <Renderer data={data.json} meta={props} initialValues={data.json} instance={this}/>}
        </ScrollView>

        {showMeta &&
        <ScrollView className='padding-smaller bg-neutral inverted'>
          <Row className='wrap spread'>
            <View className='margin-smaller'>
              <Upload {...uploadProps} label='*_data.json' onUpload={this.handleUpload.bind(this, 'data')}
                      className={'radius-large' + (!hasData ? ' bg-primary-dark' : '')}
              >
                {data.name && <View><Text className='h4'>{_.UPLOADED}</Text><Text>{data.name}</Text></View>}
              </Upload>
            </View>
            <View className='margin-smaller'>
              <Upload {...uploadProps} label='*_meta.json' onUpload={this.handleUpload.bind(this, 'meta')}
                      className={'radius-large' + (hasData && !hasMeta ? ' bg-primary-dark' : '')}
                      disabled={!hasData}
              >
                {meta.name && <View><Text className='h4'>{_.UPLOADED}</Text><Text>{meta.name}</Text></View>}
              </Upload>
            </View>
            <View className='margin-smaller min-width-290'>
              <Row className='middle justify'>
                {hasMeta && <Text className='h6 no-margin fade-in-up'>{_.CONFIG_USED}</Text>}
                <LanguageSelection className='right margin-left-small'/>
              </Row>
              {hasMeta && <View className='fade-in-down'><Json data={meta.json} inverted/></View>}
            </View>
          </Row>
        </ScrollView>
        }
      </>
    )
  }
}

@connect(mapStateToProps, mapDispatchToProps)
@withForm({form: 'DEMO', enableReinitialize: true})
class Renderer extends Component {
  static propTypes = {
    data: PropTypes.any.isRequired,
    meta: PropTypes.any.isRequired,
    instance: PropTypes.any, // parent instance to attach data from this component
  }

  componentDidMount () {
    if (this.props.instance) this.props.instance._resetForm = this.resetForm
  }

  resetForm = () => {
    const {dispatch, form} = this.props
    dispatch(reset(form))
  }

  /**
   * Handle Redux-Form submit, which expects a promise return value
   */
  submit = (values) => {
    return this.props.actions.popup({title: 'Submitted Form with these values', content: <Json data={values}/>})
  }

  handleSubmit = this.props.handleSubmit(this.submit)

  render () {
    const {data, meta} = this.props
    return (
      <form onSubmit={this.handleSubmit}>
        {<Render data={data} {...meta}/>}
      </form>
    )
  }
}
