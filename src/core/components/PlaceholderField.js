import PropTypes from 'prop-types'
import React from 'react'
import { l, localiseTranslation, toLowerCase } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import Text from './Text'
import View from './View'

localiseTranslation({
  FIELD_DOES_NOT_EXIST_: {
    [l.ENGLISH]: 'Field does not exist!',
  }
})

/**
 * Placeholder Field - Pure Component.
 */
export function PlaceholderField ({name, ...props} = {}) {
  if (props.children == null)
    props.children = <Text className="p error padding border">
      <Text className="bold">{name}</Text>{toLowerCase(_.FIELD_DOES_NOT_EXIST_)}
    </Text>
  return <View {...props}/>
}

PlaceholderField.propTypes = {
  name: PropTypes.any
}

export default React.memo(PlaceholderField)
