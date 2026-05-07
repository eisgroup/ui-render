import classNames from '../../utils/classNames'
import PropTypes from 'prop-types'
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { by, pluralize, shortNumber, toAlphaNumId, toList, toListValuesTotal, truncate } from '../../utils'
import { renderFloat } from '../renders'
import Row from '../Row'
import { STYLE } from '../styles'
import Text from '../Text'
import View from '../View'
import { renderGradients } from './utils'
import { colorsPalette } from './constants'

const RADIAN = Math.PI / 180
const fontSize = 14
const id = 'pc'
const renderGradient = renderGradients({ id, startOpacity: 0.67, stopOpacity: 1 })
const textColor = '#444'

/**
 * Pie Chart Component (custom SVG donut, no recharts dependency).
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
  const sorts = toList(sort, 'clean')
  const items = sort ? [..._items].sort(by(...sorts)) : _items
  const data = useMemo(() => dataNormalized(items, gradient, sorts), [items, gradient, sort]) // eslint-disable-line react-hooks/exhaustive-deps
  const Container = legends ? (legends.bottom ? View : Row) : Fragment
  const showPointers = pointers || (!legends && pointers !== false)

  return (
    <Container {...legends && { className: classNames('app__pie-chart--ref middle center wrap', classNameWrap) }}>
      <View className={classNames('app__pie-chart min-width-290 center', className, { gradient })} {...props}>
        <DonutChart data={data} height={height} gradient={gradient} showPointers={showPointers} unit={unit} />
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
// SVG DONUT
// ---------------------------------------------------------------------------

function DonutChart ({ data, height, gradient, showPointers, unit }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [hovered, setHovered] = useState(null) // {slice, x, y} | null

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    if (typeof ResizeObserver === 'undefined') {
      setWidth(node.clientWidth || height)
      return
    }
    const ro = new ResizeObserver((entries) => {
      const w = entries[0] && entries[0].contentRect.width
      if (w != null) setWidth(w)
    })
    ro.observe(node)
    return () => ro.disconnect()
  }, [height])

  // Fall back to a square chart when width can't be measured (e.g., jsdom).
  const w = width || height
  const cx = w / 2
  const cy = height / 2
  const baseR = Math.min(w, height) / 2
  const innerR = baseR * 0.4
  const outerR = baseR * 0.6

  const slices = useMemo(() => computeSlices(data), [data])

  return (
    <div
      className='app__pie-chart__svg'
      ref={wrapRef}
      style={{ position: 'relative', width: '100%', height }}
    >
      <svg width={w} height={height} role='img'>
        {gradient && <defs>{data.map(renderGradient)}</defs>}
        <g>
          {slices.map((slice) => {
            const fillUrl = slice.gradient ? `url(#${id}-${toAlphaNumId(slice.name)})` : slice.color
            return (
              <path
                key={slice.name}
                d={arcPath(cx, cy, innerR, outerR, slice.startAngle, slice.endAngle)}
                fill={fillUrl}
                stroke={fillUrl}
                strokeWidth={0}
                data-name={slice.name}
                data-color={slice.color}
                onMouseEnter={(e) => setHovered({ slice, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
                onMouseMove={(e) => setHovered({ slice, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
          {slices.map((slice) => {
            const fill = slice.gradient ? `url(#${id}-${toAlphaNumId(slice.name)})` : slice.color
            const labelProps = {
              cx, cy,
              midAngle: slice.midAngle,
              innerRadius: innerR,
              outerRadius: outerR,
              percent: slice.percent,
              fill,
              color: slice.color,
              name: slice.name,
            }
            return (
              <Fragment key={slice.name}>
                {showPointers ? renderPercentPointer(labelProps) : renderPercent(labelProps)}
              </Fragment>
            )
          })}
        </g>
      </svg>
      {hovered && <PieTooltip x={hovered.x} y={hovered.y} slice={hovered.slice} unit={unit} />}
    </div>
  )
}

function PieTooltip ({ x, y, slice, unit }) {
  const { name, value } = slice
  const decimals = Math.max(6 - (Math.round(value) || 0).toString().length, 0)
  return (
    <View
      className='app__chart__tooltip'
      style={{
        position: 'absolute',
        left: x + 10,
        top: y + 10,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <View className='fill--width center'>
        <Text className='truncate'>{name}</Text>
        <Text className='row'>
          {renderFloat(Number(value).toFixed(decimals))} {unit ? pluralize(unit, value) : ''}
        </Text>
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// SVG GEOMETRY
// ---------------------------------------------------------------------------

// Recharts-compatible angle convention: 0° = right (3 o'clock), 90° = top (12 o'clock),
// counter-clockwise positive. Slices fill clockwise on screen, i.e. angles decrease.
function polarToCartesian (cx, cy, radius, angleDeg) {
  const rad = -angleDeg * RADIAN
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  }
}

function computeSlices (data) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  let startAngle = 90 // top
  return data.map((d) => {
    const sweep = (d.value / total) * 360
    const endAngle = startAngle - sweep
    const slice = {
      ...d,
      startAngle,
      endAngle,
      midAngle: (startAngle + endAngle) / 2,
      percent: d.value / total,
    }
    startAngle = endAngle
    return slice
  })
}

function arcPath (cx, cy, innerR, outerR, startAngle, endAngle) {
  const sweep = startAngle - endAngle
  // Full circle: SVG can't draw a 360° arc in one segment — use two semicircles.
  if (sweep >= 360 - 1e-6) {
    return [
      `M ${cx} ${cy - outerR}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx} ${cy + outerR}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx} ${cy - outerR}`,
      `M ${cx} ${cy - innerR}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx} ${cy + innerR}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR}`,
      'Z',
    ].join(' ')
  }
  const largeArc = sweep > 180 ? 1 : 0
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle)
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle)
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle)
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle)
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

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
  const { bottom, columns, background = true } = legends || {}
  const classes = classNames('app__pie-chart__ref__items padding-small', { background, wrap: columns > 0 })
  const offsetTop = bottom ? { marginTop: height * -0.1 } : undefined

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

function renderReferenceItem ({ name, color, value }) {
  return (
    <Row key={name} className='app__pie-chart__ref__item justify'>
      <Text className='truncate padding-right'>{name}</Text>
      <Text style={{ color }}>{value.toLocaleString()}</Text>
    </Row>
  )
}

// ---------------------------------------------------------------------------
// DATA HELPERS
// ---------------------------------------------------------------------------

function dataNormalized (items, gradient, sorts) {
  const paletteLen = colorsPalette.length
  const list = items.map(({ id, label, value }) => ({ name: id || label, gradient, value }))
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

function donutPieCenterCoords ({ cx, cy, midAngle, innerRadius, outerRadius }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return { x, y }
}

function renderPercent ({ cx, cy, midAngle, innerRadius, outerRadius, percent, fill, color }) {
  const pct = percent * 100
  if (pct < 1) return null
  const fontScale = Math.min(pct + 5, fontSize)
  const percentColor = fill === 'none' ? color : textColor
  const { x, y } = donutPieCenterCoords({ cx, cy, midAngle, innerRadius, outerRadius })

  return (
    <g style={{ pointerEvents: 'none' }}>
      <text x={x} y={y} fill={percentColor} textAnchor='middle' dominantBaseline='central' fontSize={fontScale - 2}>
        {Math.round(pct) + '%'}
      </text>
    </g>
  )
}

function renderPercentPointer ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent, fill, color }) {
  const pct = percent * 100
  name = truncate(name, 9, 2)
  if (pct < 1) return null
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const angleEffect = Math.abs(cos)
  const radiusEffect = outerRadius / 13
  const fontScale = Math.min(pct + 5, fontSize)

  const percentColor = fill === 'none' ? color : STYLE.TEXT_LIGHT
  const { x, y } = donutPieCenterCoords({ cx, cy, midAngle, innerRadius, outerRadius })

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
    <g style={{ pointerEvents: 'none' }}>
      <text x={x} y={y} fill={percentColor} stroke={textColor} textAnchor='middle' dominantBaseline='central' fontSize={fontScale - 2}>
        {Math.round(pct) + '%'}
      </text>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={textColor} fill='none'/>
      <circle cx={ex} cy={ey} r={Math.min(lineSize / 4, 2)} fill={textColor} stroke='none'/>
      <text x={xOuter} y={ey} dy={labelSize / 3} textAnchor={textAnchor} fill={textColor} fontSize={labelSize}>{name}</text>
    </g>
  )
}
