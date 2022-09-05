import cn from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { isEmpty } from 'ui-utils-pack'
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
  classNameInner,
  classNameItem,
  onClick,
  ...props
}) {
  if (isEmpty(items)) return null
  const Container = label ? View : Row
  return (
    <Container className={cn('app__tags margin-v-smaller', className)} {...props}>
      {label && <Text><Icon name="tags"/>{label}</Text>}
      <Row className={cn('wrap middle', classNameInner)}>
        {!label && <Icon name="tags" className="margin-right-smaller"/>}
        {items.map(tag => (
          <View
            key={tag}
            className={cn('app__tag', classNameItem, {'no-pointer no-interaction': !onClick})}
            onClick={() => onClick && onClick(tag)}
          >
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
