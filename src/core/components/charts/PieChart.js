import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Fragment, useMemo, useRef } from 'react'
import { Cell, Pie, PieChart as Piechart, ResponsiveContainer, Tooltip } from 'recharts'
import { by, pluralize, shortNumber, throttle, toAlphaNumId, toList, toListValuesTotal, truncate } from '../../utils'
import { renderFloat } from '../renders'
import Row from '../Row'
import { STYLE } from '../styles'
import Text from '../Text'
import View from '../View'
import { chartTooltip, renderGradients } from './utils'
import { colorsPalette } from './constants'

const RADIAN = Math.PI / 180
const fontSize = 14
const id = 'pc'
const renderGradient = renderGradients({id, startOpacity: 0.67, stopOpacity: 1})
const textColor = '#444'

/**
 * Pie Chart Component
 */
function PieChart ({
  items: _items,
  height = 290,
  unit,
  classNameWrap,
  className,
  children,
  gradient = true,
  legends,
  pointers,
  sort,
  ...props
}) {
  const unitRef = useRef(unit)
  unitRef.current = unit

  const sorts = toList(sort, 'clean')
  const items = sort ? [..._items].sort(by(...sorts)) : _items
  const data = useMemo(() => dataNormalized(items, gradient, sorts), [items, gradient, sort]) // eslint-disable-line react-hooks/exhaustive-deps
  const Container = legends ? (legends.bottom ? View : Row) : Fragment
  const showPointers = pointers || (!legends && pointers !== false)

  const renderTooltipContent = useMemo(() => {
    return throttle(({active, payload}) => {
      if (!active) return null
      const items = toList(payload, true)
      const total = toListValuesTotal(items)
      const decimals = Math.max(6 - (Math.round(total) || 0).toString().length, 0)
      return (
        <View className='app__chart__tooltip'>
          {items.map(({payload: {name, value, color} = {}}, i) => (
            <View key={name || i} className='fill--width center'>
              <Text className='truncate'>{name}</Text>
              <Text className='row'>
                {renderFloat(Number(value).toFixed(decimals))} {unitRef.current ? pluralize(unitRef.current, value) : ''}
              </Text>
            </View>
          ))}
        </View>
      )
    }, 50)
  }, [])

  return (
    <Container {...legends && {className: classNames('app__pie-chart--ref middle center wrap', classNameWrap)}}>
      <View className={classNames('app__pie-chart min-width-290 center', className, {gradient})} {...props}>
        <ResponsiveContainer height={height}>
          <Piechart>
            {gradient && <defs>{data.map(renderGradient)}</defs>}
            <Pie
              data={data}
              dataKey='value'
              innerRadius='40%'
              outerRadius='60%'
              labelLine={false}
              label={showPointers ? renderPercentPointer : renderPercent}
              strokeWidth={0}
            >
              {data.map(({name, color, gradient: grad}) => {
                const fill = grad ? `url(#${id}-${toAlphaNumId(name)})` : color
                return <Cell key={name} fill={fill} stroke={fill} color={color} />
              })}
            </Pie>
            <Tooltip {...chartTooltip} content={renderTooltipContent}/>
          </Piechart>
        </ResponsiveContainer>
        <View className='position-center center fade-in-slow'>
          {children != null
            ? (typeof children === 'object' ? children : <Text className='center'>{children}</Text>)
            : <PieTotal items={_items} />
          }
        </View>
      </View>
      {legends && <PieReference data={data} legends={legends} height={height} />}
    </Container>
  )
}

PieChart.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.any.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  height: PropTypes.number,
  unit: PropTypes.string,
  className: PropTypes.string,
  classNameWrap: PropTypes.string,
  children: PropTypes.any,
  gradient: PropTypes.bool,
  legends: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      background: PropTypes.bool,
      bottom: PropTypes.bool,
      columns: PropTypes.number,
    })
  ]),
  pointers: PropTypes.bool,
  sort: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
}

export default React.memo(PieChart)

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------

function PieTotal ({ items }) {
  return (
    <>
      <Text className='h2 no-margin padding-bottom-smaller'>{shortNumber(toListValuesTotal(items))}</Text>
      <Text>Total</Text>
    </>
  )
}

function PieReference ({ data, legends, height }) {
  const {bottom, columns, background = true} = legends || {}
  const classes = classNames('app__pie-chart__ref__items padding-small', {background, wrap: columns > 0})
  const offsetTop = bottom ? {marginTop: height * -0.1} : undefined

  if (columns > 0) {
    const itemsPerCol = Math.ceil(data.length / columns)
    return (
      <Row className='top' style={offsetTop}>
        {Array(columns).fill(true).map((_, index) => {
          const start = index * itemsPerCol
          return (
            <View key={index} className={classes}>
              {data.slice(start, start + itemsPerCol).map(renderReferenceItem)}
            </View>
          )
        })}
      </Row>
    )
  }

  return <View className={classes} style={offsetTop}>{data.map(renderReferenceItem)}</View>
}

function renderReferenceItem ({name, color, value}) {
  return (
    <Row key={name} className='app__pie-chart__ref__item justify'>
      <Text className='truncate padding-right'>{name}</Text>
      <Text style={{color}}>{value.toLocaleString()}</Text>
    </Row>
  )
}

// ---------------------------------------------------------------------------
// DATA HELPERS
// ---------------------------------------------------------------------------

function dataNormalized (items, gradient, sorts) {
  const paletteLen = colorsPalette.length
  const list = items.map(({id, label, value}) => ({name: id || label, gradient, value}))
  const mapper = (item, i) => {
    item.color = colorsPalette[i % paletteLen]
    return item
  }
  if (sorts && sorts.length) {
    return list.sort(by(...sorts)).map(mapper)
  }
  return list.map(mapper)
}

// ---------------------------------------------------------------------------
// LABEL RENDERERS (pure functions, shared across instances)
// ---------------------------------------------------------------------------

function donutPieCenterCoords ({cx, cy, midAngle, innerRadius, outerRadius}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return {x, y}
}

function renderPercent ({cx, cy, midAngle, innerRadius, outerRadius, percent, fill, color}) {
  const pct = percent * 100
  if (pct < 1) return null
  const fontScale = Math.min(pct + 5, fontSize)
  const percentColor = fill === 'none' ? color : textColor
  const {x, y} = donutPieCenterCoords({cx, cy, midAngle, innerRadius, outerRadius})

  return (
    <g>
      <text x={x} y={y} fill={percentColor} textAnchor='middle' dominantBaseline='central' fontSize={fontScale - 2}>
        {Math.round(pct) + '%'}
      </text>
    </g>
  )
}

function renderPercentPointer ({cx, cy, midAngle, innerRadius, outerRadius, name, percent, fill, color}) {
  const pct = percent * 100
  name = truncate(name, 9, 2)
  if (pct < 1) return null
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const angleEffect = Math.abs(cos)
  const radiusEffect = outerRadius / 13
  const fontScale = Math.min(pct + 5, fontSize)

  const percentColor = fill === 'none' ? color : STYLE.TEXT_LIGHT
  const {x, y} = donutPieCenterCoords({cx, cy, midAngle, innerRadius, outerRadius})

  const labelSize = Math.max(fontScale - Math.max(0, name.length - 5) * angleEffect, 6)
  const lineScale = Math.min(pct + 2, radiusEffect)
  const lineSize = lineScale * (1 - angleEffect / 2)
  const sx = cx + outerRadius * cos
  const sy = cy + outerRadius * sin
  const mx = cx + (outerRadius + lineSize) * cos
  const my = cy + (outerRadius + lineSize) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * lineSize
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'
  const xOuter = ex + (cos >= 0 ? 1 : -1) * lineScale / 2

  return (
    <g>
      <text x={x} y={y} fill={percentColor} stroke={textColor} textAnchor='middle' dominantBaseline='central' fontSize={fontScale - 2}>
        {Math.round(pct) + '%'}
      </text>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={textColor} fill="none"/>
      <circle cx={ex} cy={ey} r={Math.min(lineSize / 4, 2)} fill={textColor} stroke="none"/>
      <text x={xOuter} y={ey} dy={labelSize / 3} textAnchor={textAnchor} fill={textColor}
            fontSize={labelSize}>{name}</text>
    </g>
  )
}
