import React, { PureComponent } from 'react'
import JsonView from 'react-ui-pack/JsonView'
import ScrollView from 'react-ui-pack/ScrollView'
import Text from 'react-ui-pack/Text'
import data from './examples/_data'
import meta from './examples/_meta'
import UIRender from './rules'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * todo: adds docs about debug attribute
 * -----------------------------------------------------------------------------
 */
export default class OpenL extends PureComponent {
  state = {
    showMeta: false,
  }

  render () {
    const {showMeta} = this.state
    return (
      <>
        <UIRender
          initialValues={data}
          data={data}
          meta={meta}
          childeBefore={
            <Text className="h1 center padding bg-grey no-margin">All Possible Configurations of The UI Render</Text>
          }/>

        {showMeta &&
        <ScrollView className="padding bg-neutral inverted json-tree">
          <JsonView data={meta} inverted/>
        </ScrollView>
        }
      </>
    )
  }
}
