import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { isEmpty } from 'utils-pack'
import Icon from './Icon'
import Row from './Row'
import Text from './Text'
import View from './View'

// List of Tags
export function Tags ({
  items,
  defByCode, // example: tag.select.tagById(state)
  label,
  className,
  ...props
}) {
  if (isEmpty(items)) return null
  const Container = label ? View : Row
  return (
    <Container className={classNames('app__tags margin-v-smaller', className)} {...props}>
      <Text><Icon name="tags"/>{label}</Text>
      <Row className="wrap">
        {items.map(tag => (
          <View key={tag} className="app__tag no-pointer no-interaction">
            {(defByCode[tag] || {}).name}
          </View>
        ))}
      </Row>
    </Container>
  )
}

Tags.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  defByCode: PropTypes.object.isRequired,
  label: PropTypes.string,
}

export default React.memo(Tags)
