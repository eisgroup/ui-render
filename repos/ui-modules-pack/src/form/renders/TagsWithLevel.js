import classNames from 'classnames'
import { DEFINITION_BY_VAL } from 'ui-modules-pack/variables/definitions'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import Button from 'ui-react-pack/Button'
import Row from 'ui-react-pack/Row'
import Text from 'ui-react-pack/Text'
import { isList } from 'ui-utils-pack'
import { SliderLabeled } from '../renders'

/**
 * Tags with Level - Component.
 * (Clickable tags that expand Slider of given tag's level)
 * @example:
 *    <TagsWithLevel {...FIELD.DEF[FIELD.ID.LANGUAGE]} items={items}/>
 */
function TagsWithLevel ({
  kind,
  level,
  items,
  min,
  max,
  unit,
  className,
  style,
  ...props
}) {
  const [slider, setDisplay] = useState(null)
  if (!items.length) return
  const definitionByCode = DEFINITION_BY_VAL[kind]
  if (!definitionByCode) return console.error(TagsWithLevel.name + '() requires definitionByValue for', kind) || null
  return (
    <>
      {slider && <SliderLabeled {...{
        ...slider,
        readonly: true,
        min,
        max,
        unit,
        // Label layout
        render: (value) => isList(value)
          ? (
            <>
              {(level[value[0]] || {}).name}
              <Text className='fade margin-h-smaller'>-</Text>
              {(level[value[1]] || {}).name} {unit}
            </>
          )
          : (
            <>
              {(level[value] || {}).name} {unit}
            </>
          ),
      }}/>}
      <Row className={classNames('wrap', className)} style={style} {...props}>
        {items.map(({code, value}) => {
          const label = (definitionByCode[code] || {}).name
          return (
            <Button
              key={code} className='app__tag'
              onClick={() => setDisplay((slider && slider.name === code) ? null : {name: code, label, value})}
            >
              {label}
            </Button>
          )
        })}
      </Row>
    </>
  )
}

TagsWithLevel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.number,
    ]).isRequired,
  })).isRequired,
  // Same as FieldsWithLevel
  kind: PropTypes.string.isRequired, // type of definition to use - TYPE.key enum ['lang', 'phone', etc.]
  level: PropTypes.object.isRequired, // Definition of Level by code (ex. DEFINITION_BY_VAL.LANGUAGE_LEVEL)
  min: PropTypes.number.isRequired, // Slider's minimum value
  max: PropTypes.number.isRequired, // Slider's maximum value
  unit: PropTypes.string, // value unit
  className: PropTypes.string,
  style: PropTypes.object,
}

export default React.memo(TagsWithLevel)
