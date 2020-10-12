import PropTypes from 'prop-types'
import React from 'react'
import { l, localiseTranslation, toLowerCase } from 'utils-pack'
import { _ } from 'utils-pack/translations'
import Text from './Text'
import View from './View'

_.FIELD_DOES_NOT_EXIST = {
  [l.ENGLISH]: 'Field does not exist!',
  // [l.RUSSIAN]: 'Поля не существует!',
}
localiseTranslation(_)

/**
 * Placeholder Field - Pure Component.
 */
export function PlaceholderField ({name, ...props} = {}) {
  if (props.children == null)
    props.children = <Text className='p error padding border'>
      <Text className='bold'>{name}</Text>{toLowerCase(_.FIELD_DOES_NOT_EXIST)}
    </Text>
  return <View {...props}/>
}

PlaceholderField.propTypes = {
  name: PropTypes.any
}

export default React.memo(PlaceholderField)
