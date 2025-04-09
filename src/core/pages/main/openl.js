import React, { PureComponent } from 'react'
import JsonView from 'ui-react-pack/JsonView'
import ScrollView from 'ui-react-pack/ScrollView'
import Text from 'ui-react-pack/Text'
import data from '../examples/_data'
import meta from '../examples/_meta'
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
          className="bg-info-light"
          initialValues={data}
          data={data}
          meta={meta}
          childBefore={
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
