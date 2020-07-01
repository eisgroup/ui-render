import PropTypes from 'prop-types'
import React from 'react'
import { isEmpty } from 'utils-pack'
import Icon from './Icon'
import Row from './Row'
import Text from './Text'
import View from './View'

// List of Tags
export default function Tags
  ({
    items,
    defByCode, // example: DEFINITION_BY_CODE.LANGUAGE
    label,
  }) {
  if (isEmpty(items)) return null
  const Wrap = label ? View : Row
  return (
    <Wrap className='margin-v-smaller'>
      <Text><Icon name='tags'/>{label}</Text>
      <Row className='wrap'>
        {items.map(tag => (
          <View key={tag} className='app__tag no-pointer no-interaction'>
            {(defByCode[tag] || {}).name}
          </View>
        ))}
      </Row>
    </Wrap>
  )
}

Tags.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  defByCode: PropTypes.object.isRequired,
  label: PropTypes.string,
}
