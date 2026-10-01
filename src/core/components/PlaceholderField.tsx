import React from 'react'
import { l, localiseTranslation, toLowerCase } from '../utils'
import { _ } from '../utils/translations'
import Text from './Text'
import View from './View'

localiseTranslation({
  FIELD_DOES_NOT_EXIST_: {
    [l.ENGLISH]: 'Field does not exist!',
  }
})

/**
 * The named props are read here; the rest goes to the `View`. `renders.js` binds them as the first
 * argument, so the props React passes arrive second and go unread.
 */
export type PlaceholderFieldProps = { name?: React.ReactNode, children?: React.ReactNode, [key: string]: unknown }

/**
 * Placeholder Field - Pure Component.
 * (The overload is what callers see: with `= {}` the props would be optional, and JSX checked too loosely.)
 */
export function PlaceholderField (props: PlaceholderFieldProps): React.ReactElement
export function PlaceholderField ({name, ...props}: PlaceholderFieldProps = {}) {
  if (props.children == null)
    props.children = <Text className="p error padding border">
      <Text className="bold">{name}</Text>{toLowerCase(_.FIELD_DOES_NOT_EXIST_)}
    </Text>
  return <View {...props}/>
}

export default React.memo(PlaceholderField)
