import React, { useCallback, useRef, useState } from 'react'
import Button from '../../core/components/Button'
import Expand from '../../core/components/Expand'
import Icon from '../../core/components/Icon'
import JsonView from '../../core/components/JsonView'
import { LinkOut } from '../../core/components/LinkOut'
import Row from '../../core/components/Row'
import ScrollView from '../../core/components/ScrollView'
import View from '../../core/components/View'
import { toJSON } from '../../core/utils'
import { goTo } from '../../core/common/variables'
import { EXAMPLES, hasFlag } from '../examples/manifest'
import UIRender from '../../core/engine/rules'

import {
  updatePerformanceData,
  downloadHistoricalFileTemplate,
  uploadHistoricalFile
} from '../api/gdn-rating-alg'
import { downloadFromUrl } from '../api/staticFiles'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * List of UI Render Documentation Examples Accordion
 *
 * The example set itself lives in `src/demo/examples/manifest.js` — the single
 * manifest shared with the test harness. This file only renders it.
 * -----------------------------------------------------------------------------
 */
function onSomeDataChanged () {
  console.info('Form data has been changed')
}

function showValidationErrors (errors) {
  console.info('Validation errors', errors)
}

export default function Examples () {
  const [activeIndex, setActiveIndex] = useState(null)
  // The document hands its form-data reader to the host through `getFormData`; the class kept it on `this`.
  const getFormData = useRef(null)

  // Stable, as the class's handler fields were.
  const toggleExpand = useCallback(({expanded, value, key: id}) => {
    setActiveIndex(expanded ? value : null)
    if (expanded) goTo(`#${id}`)
  }, [])

  const onGetDataButtonClick = useCallback(() => {
    const data = getFormData.current()
    console.info('Form data: ', data);
  }, [])

  const hash = (typeof window !== 'undefined') ? (window.location.hash || '').substr(1) : ''
  return (
    <View className="app__examples bg-white border">
      {EXAMPLES.map((example, i) => {
        const {data, meta, title, id} = example
        return (
          <Expand
            id={id}
            key={title}
            index={i}
            expanded={i === activeIndex || id === hash}
            title={title}
            onClick={toggleExpand}
            classNameLabel="inverted bg-inverse"
            classNameItems="bg-inverse"
          >
            {() => (
              <>
                { hasFlag(example, 'hostApi') ? (
                  <>
                    <UIRender
                      data={data}
                      meta={meta}
                      initialValues={data}
                      form={obj}
                      getFormData={(f) => { getFormData.current = f }}
                      onDataChanged={onSomeDataChanged}
                      onSubmit={console.warn}
                      getValidationErrors={showValidationErrors}
                      translate={(v) => v}
                      dateFormat={"MM-DD-YYYY"}
                      apiCalls={{
                        updateData: updatePerformanceData,
                        downloadFile: downloadHistoricalFileTemplate,
                        uploadFile: uploadHistoricalFile
                      }}
                    />
                    <View className="app__examples bg-white border">
                      <Button onClick={onGetDataButtonClick}>Get Data (the ability to request data from outside)</Button>
                    </View>
                  </>
                ) : (
                  <UIRender
                    data={data}
                    meta={meta}
                    initialValues={data}
                    form={obj}
                    onSubmit={console.warn}
                    apiCalls={{ downloadFile: downloadFromUrl }}
                  />
                )}
                <ScrollView className="padding-smaller bg-neutral inverted">
                  <Row className="wrap spread">
                    <View fill className="padding-smaller min-width-320">
                      <h3>
                        <LinkOut
                          to={`data:text/json;charset=utf-8,${encodeURIComponent(toJSON(meta, null, 2))}`}
                          download={`${id}_meta.json`}
                        >
                          {'Meta.json'} <Icon name="file-download" className="large"/>
                        </LinkOut>
                      </h3>
                      <JsonView data={meta} inverted/>
                    </View>
                    <View fill className="padding-smaller min-width-320">
                      <h3>
                        <LinkOut
                          to={`data:text/json;charset=utf-8,${encodeURIComponent(toJSON(data, null, 2))}`}
                          download={`${id}_data.json`}
                        >
                          {'Data.json'} <Icon name="file-download" className="large"/>
                        </LinkOut>
                      </h3>
                      <JsonView data={data} inverted/>
                    </View>
                  </Row>
                </ScrollView>
              </>
            )}
          </Expand>
        )
      })}
    </View>
  )
}

const obj = {id: 'example'} // can be boolean true
