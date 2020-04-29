import chroma from 'chroma-js'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { Pie, PieChart as Piechart, ResponsiveContainer, Tooltip } from 'recharts'
import { TEXT_LIGHT } from '../../common/styles'
import {
  by,
  gradientColors,
  pluralize,
  shortNumber,
  throttle,
  toList,
  toListValuesTotal,
  truncate
} from '../../common/utils'
import { renderFloat } from '../renders'
import Row from '../Row'
import Text from '../Text'
import View from '../View'
import { chartTooltip, renderCells, renderGradients } from './utils'

const RADIAN = Math.PI / 180
const fontSize = 14 // label size
const id = 'pc' // unique id prefix for this chart type
const renderCell = renderCells(id)
const renderGradient = renderGradients({id, startOpacity: 0.67, stopOpacity: 1})
let decimals, unit

/**
 * Pie Chart Component
 */
export default class PieChart extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.any.isRequired,
        value: PropTypes.number.isRequired,
      })
    ).isRequired,
    height: PropTypes.number, // the size fo the pie chart
    unit: PropTypes.string, // text to render next to value
    className: PropTypes.string,
    classNameWrap: PropTypes.string,
    colors: PropTypes.array,
    children: PropTypes.any, // content to render inside the pie, will override default Label
    gradient: PropTypes.bool, // default is true
    legends: PropTypes.bool, // whether to render Legends to the side of Pie Chart, default is false
    pointers: PropTypes.bool, // whether to render reference pointers to each pie, default is true if `legends` is false
    sort: PropTypes.oneOfType([ // items sorting order
      PropTypes.string, // key path to value used for sorting item's order, prefix with `-` for descending order
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }

  static defaultProps = {
    height: 290,
  }

  renderTotal = () => {
    return (
      <>
        <Text className='h2 no-margin padding-bottom-smaller'>{shortNumber(toListValuesTotal(this.props.items))}</Text>
        <Text>Total</Text>
      </>
    )
  }

  renderReference = () => {
    return (
      <View className='app__pie-chart__ref__items padding-small'>
        {this.data.map(({name, color, value}) => (
          <Row key={name} className='app__pie-chart__ref__item justify'>
            <Text className='truncate padding-right'>{name}</Text>
            <Text style={{color}}>{value.toLocaleString()}</Text>
          </Row>
        ))}
      </View>
    )
  }

  render () {
    const {
      items: _items, height, unit: u, classNameWrap, className, children,
      gradient = true, colors: colours, legends, pointers, sort,
      ...props
    } = this.props
    unit = u
    const sorts = toList(sort, 'clean')
    const items = sort ? [..._items].sort(by(...sorts)) : _items
    const Container = legends ? Row : Fragment
    const colors = gradientColors(items.length, colours)
    this.data = dataNormalized(items, colors, gradient, sorts)
    return (
      <Container {...legends && {className: classNames('app__pie-chart--ref middle wrap', classNameWrap)}}>
        <View className={classNames('app__pie-chart min-width-290 center', className, {gradient})} {...props}>
          <ResponsiveContainer height={height}>
            <Piechart>
              {gradient && <defs>{this.data.map(renderGradient)}</defs>}
              <Pie
                data={this.data}
                dataKey='value'
                innerRadius='40%'
                outerRadius='60%'
                labelLine={false}
                label={(pointers || (!legends && pointers !== false)) ? renderPercentPointer : renderPercent}
                strokeWidth={0}
                children={this.data.map(renderCell)}
              />
              <Tooltip {...chartTooltip} content={renderTooltip}/>
            </Piechart>
          </ResponsiveContainer>
          <View className='position-center center fade-in-slow'>
            {children != null
              ? (typeof children === 'object' ? children : <Text className='center'>{children}</Text>)
              : this.renderTotal()
            }
          </View>
        </View>
        {legends && this.renderReference()}
      </Container>
    )
  }
}

/**
 * Converted given Data to normalized list for Chart Rendering
 */
function dataNormalized (items, colors, gradient, sorts = ['-value', 'name']) {
  const list = items.map(({id, label, value}) => ({name: id || label, gradient, value}))
  return list.sort(by(...sorts)).map((item, i) => {
    item.color = colors[i]
    return item
  })
}

/**
 * Get Coordinates of Center Point within each Pie in a Donut
 */
function donutPieCenterCoords ({cx, cy, midAngle, innerRadius, outerRadius}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return {x, y}
}

function renderPercent ({cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, name, percent, fill, color}) {
  percent = percent * 100
  if (percent < 1) return null
  const fontScale = Math.min(percent + 5, fontSize)  // make font size smaller if percent is low

  /* Inner Label */
  const percentColor = fill === 'none' ? color : TEXT_LIGHT
  const {x, y} = donutPieCenterCoords({cx, cy, midAngle, innerRadius, outerRadius})

  return (
    <g>
      <text x={x} y={y} fill={percentColor} textAnchor='middle' dominantBaseline='central' fontSize={fontScale - 2}>
        {Math.round(percent) + '%'}
      </text>
    </g>
  )
}

function renderPercentPointer ({cx, cy, midAngle, innerRadius, outerRadius, name, percent, fill, color}) {
  percent = percent * 100
  name = truncate(name, 9, 2)
  if (percent < 1) return null
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)  // at start angle cos = -1, at end angle cos = 1
  const angleEffect = Math.abs(cos)
  const radiusEffect = outerRadius / 13
  const fontScale = Math.min(percent + 5, fontSize)  // make font size smaller if percent is low

  /* Inner Label */
  const percentColor = fill === 'none' ? color : TEXT_LIGHT
  const {x, y} = donutPieCenterCoords({cx, cy, midAngle, innerRadius, outerRadius})

  /* Out Label */
  const labelColor = chroma(color).alpha(0.7).css()
  const labelSize = Math.max(fontScale - Math.max(0, name.length - 5) * angleEffect, 6)  // scale to characters and angle
  const lineScale = Math.min(percent + 2, radiusEffect)  // scale line length proportionally to percent and chart size
  const lineSize = lineScale * (1 - angleEffect / 2)  // reduce to 50% size when approaching start or end angles
  const sx = cx + (outerRadius) * cos  // label line start x coordinate
  const sy = cy + (outerRadius) * sin  // label line start y coordinate
  const mx = cx + (outerRadius + lineSize) * cos  // label line break angle x coordinate
  const my = cy + (outerRadius + lineSize) * sin  // label line break angle y coordinate
  const ex = mx + (cos >= 0 ? 1 : -1) * lineSize  // horizontal label line length
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'
  const xOuter = ex + (cos >= 0 ? 1 : -1) * lineScale / 2
  return (
    <g>
      <text x={x} y={y} fill={percentColor} textAnchor='middle' dominantBaseline='central' fontSize={fontScale - 2}>
        {Math.round(percent) + '%'}
      </text>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={labelColor} fill="none"/>
      <circle cx={ex} cy={ey} r={Math.min(lineSize / 4, 2)} fill={labelColor} stroke="none"/>
      <text x={xOuter} y={ey} dy={labelSize / 3} textAnchor={textAnchor} fill={labelColor}
            fontSize={labelSize}>{name}</text>
    </g>
  )
}

const renderTooltip = throttle(({active, payload}) => {
  if (!active) return null
  const items = toList(payload, true)
  const total = toListValuesTotal(items)
  // Show up to 7 digits
  decimals = Math.max(6 - (Math.round(total) || 0).toString().length, 0)
  return (
    <View className='app__chart__tooltip'>
      {items.map(renderTooltipItem)}
    </View>
  )
}, 50)

function renderTooltipItem ({payload: {name, value, color} = {}}, i) {
  return (
    <View key={name || i} className='fill--width center'>
      <Text className='truncate' style={{color}}>{name}</Text>
      <Text className='row'>{renderFloat(Number(value).toFixed(decimals))} {unit ? pluralize(unit, value) : ''}</Text>
    </View>
  )
}
