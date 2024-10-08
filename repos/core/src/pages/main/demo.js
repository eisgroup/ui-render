import { POPUP } from 'ui-modules-pack/popup/constants'
import { connect, stateAction } from 'ui-modules-pack/redux'
import settings from 'ui-modules-pack/settings'
import LanguageSelection from 'ui-modules-pack/settings/views/LanguageSelection'
import Upload from 'ui-modules-pack/upload/views/Upload'
import { FILE } from 'ui-modules-pack/variables'
import React, { Component } from 'react'
import JsonView from 'ui-react-pack/JsonView'
import Row from 'ui-react-pack/Row'
import ScrollView from 'ui-react-pack/ScrollView'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { ALERT, GET, isEmpty, l, localiseTranslation, performStorage, SET } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import UIRender from './rules'
import { downloadHistoricalFileTemplate, updateExperienceData, uploadHistoricalFile } from 'web/api/gdn-rating-alg'
import { Button } from 'ui-react-pack/Button'

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

  onGetDataButtonClick = () => {
    const data = this.getFormData();
    console.info('Form data: ', data);
  }

  handleUpload = (kind, [file], name) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        let json = JSON.parse(reader.result)
        this.setState({[kind]: {json, name: file.name}}, () => {
          if (kind === 'data') performStorage(SET, DEMO_JSON_STORAGE_KEY, {[kind]: this.state.data})
        })
      } catch (error) {
        this.props.actions.popup({
          title: `${file.name} is invalid ${name} file`,
          content: <View>
            <Text className="h5">{_.ERROR_MESSAGE}</Text>
            <Text className="p">{String(error)}</Text>
          </View>
        })
      }
    }
    reader.readAsText(file)
  }

  render () {
    const {data, meta, showMeta} = this.state
    const hasData = data.json != null // data.json can be empty object
    const hasMeta = !isEmpty(meta.json)
    return (
      <>
        {showMeta &&
        <ScrollView className="padding-smaller bg-neutral inverted">
          <Row className="wrap spread">
            <View className="margin-smaller">
              <Upload {...uploadProps} label="*_data.json" onChange={this.handleUpload.bind(this, 'data')}
                      className={'test-data radius-large' + (!hasData ? ' bg-primary-dark' : '')}
              >
                {data.name && <View><Text className="h4">{_.UPLOADED}</Text><Text>{data.name}</Text></View>}
              </Upload>
            </View>
            <View className="margin-smaller">
              <Upload {...uploadProps} label="*_meta.json" onChange={this.handleUpload.bind(this, 'meta')}
                      className={'test-meta radius-large' + (hasData && !hasMeta ? ' bg-primary-dark' : '')}
                      disabled={!hasData}
              >
                {meta.name && <View><Text className="h4">{_.UPLOADED}</Text><Text>{meta.name}</Text></View>}
              </Upload>
            </View>
            <View className="margin-smaller min-width-290">
              <Row className="middle justify">
                {hasMeta && <Text className="h6 no-margin fade-in-up">{_.CONFIG_USED}</Text>}
                <LanguageSelection className="right margin-left-small"/>
              </Row>
              {hasMeta && <View className="fade-in-down"><JsonView data={meta.json} inverted/></View>}
            </View>
          </Row>
        </ScrollView>
        }
        <UIRender
          form
          className="bg-info-light"
          initialValues={data.json}
          data={data.json}
          meta={meta.json}
          translate={(v) => v}
          onSubmit={console.warn}
          getFormData={(f) => this.getFormData = f}
          apiCalls={{
            updateExperienceData,
            downloadFile: downloadHistoricalFileTemplate,
            uploadFile: uploadHistoricalFile
          }}
        />
        {hasData && hasMeta &&
          <View className="app__examples bg-white border" style={{marginTop: 20}}>
            <Button onClick={this.onGetDataButtonClick}>Output the current data state to the dev console</Button>
          </View>
        }
      </>
    )
  }
}

const uploadProps = {
  hasHeader: false,
  multiple: false,
  fileType: FILE.TYPE.JSON,
  get labelOnHover () {
    return _.FORMAT
  }
}

localiseTranslation({
  CONFIG_USED: {
    [l.ENGLISH]: 'Config Used',
  },
  FILE: {
    [l.ENGLISH]: 'File',
  },
  FILES_ONLY: {
    [l.ENGLISH]: 'files only',
  },
  FILE_UPLOAD_FAILED: {
    [l.ENGLISH]: 'File Upload Failed!',
  },
  FORMAT: {
    [l.ENGLISH]: 'Format',
  },
  MAXIMUM_FILE_SIZE_EXCEEDED: {
    [l.ENGLISH]: 'Maximum File Size Exceeded!',
  },
  MUST_BE_UNDER: {
    [l.ENGLISH]: 'must be under',
  },
  SELECT_OR_DROP: {
    [l.ENGLISH]: 'Select or Drop',
  },
  UPDATING: {
    [l.ENGLISH]: 'Updating',
  },
  UPLOAD: {
    // as verb
    [l.ENGLISH]: 'Upload',
  },
  UPLOAD_file: {
    // as verb
    [l.ENGLISH]: 'Upload {file}',
  },
  UPLOADED: {
    // as verb
    [l.ENGLISH]: 'Uploaded',
  },

  // Popup Messages
  // ---------------------------------------------------------------------------
  ARE_YOU_SURE_YOU_WANT_TO_REMOVE_file: {
    [l.ENGLISH]: 'Are you sure you want to remove {file}?',
  },
  DIMENSION_OF_file_MUST_BE_ONE_OF_aspectRatios: {
    [l.ENGLISH]: 'Dimension of {file} must be one of {aspectRatios}',
  },
  INVALID_ASPECT_RATIO: {
    [l.ENGLISH]: 'Invalid Aspect Ratio!',
  },
})
