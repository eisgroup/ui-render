import classNames from '../../utils/classNames'
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

/** A slice as a caller gives it: `id`, or else `label`, names it, and `value` sizes it. */
export type PieChartItem = { id?: string | number, label?: React.ReactNode, value: number | string, [key: string]: unknown }

/** How the legend is laid out; `true` takes the defaults. */
export type PieChartLegendOptions = { background?: boolean, bottom?: boolean, columns?: number }
export type PieChartLegends = boolean | PieChartLegendOptions

/** The named props are read here; the rest is passed to the chart's `View`. */
export type PieChartProps = {
  items: PieChartItem[]
  height?: number
  unit?: string
  classNameWrap?: string
  className?: string
  children?: React.ReactNode
  gradient?: boolean
  legends?: PieChartLegends
  pointers?: boolean
  sort?: string | string[]
  [key: string]: unknown
}

/** A slice's data, as `dataNormalized` makes it of an item. */
type PieDatum = { name: string, gradient: boolean, value: number, color: string }

/** A slice's data and its angles: what the donut draws. */
type PieSlice = PieDatum & { startAngle: number, endAngle: number, midAngle: number, percent: number }

/** Where a slice's label goes, and what it says. */
type LabelProps = {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  fill: string
  color: string
  name: string
}

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
}: PieChartProps) {
  // A cast, not a guard: `'clean'` drops the `undefined` that an absent `sort` becomes.
  const sorts = toList(sort, 'clean') as string[]
  const data = useMemo(() => {
    const validItems = Array.isArray(_items)
      ? _items.filter(item => item && typeof item === 'object')
      : []
    const items = sort ? [...validItems].sort(by(...sorts)) : validItems
    return dataNormalized(items, gradient, sorts)
  }, [_items, gradient, sort]) // eslint-disable-line react-hooks/exhaustive-deps
  // A cast, not a guard: `true` has no options, and reads `bottom` as `undefined`, as it did.
  const Container = legends ? ((legends as PieChartLegendOptions).bottom ? View : Row) : Fragment
  const showPointers = pointers || (!legends && pointers !== false)

  return (
    <Container {...legends && { className: classNames('app__pie-chart--ref middle center wrap', classNameWrap) }}>
      <View className={classNames('app__pie-chart min-width-290 center', className, { gradient })} {...props}>
        <DonutChart data={data} height={height} gradient={gradient} showPointers={showPointers} unit={unit} />
        <View className='position-center center fade-in-slow'>
          {children != null
            ? (typeof children === 'object' ? children : <Text className='center'>{children}</Text>)
            : <PieTotal items={data} />
          }
        </View>
      </View>
      {legends && <PieReference data={data} legends={legends} height={height} />}
    </Container>
  )
}

export default React.memo(PieChart)

// ---------------------------------------------------------------------------
// SVG DONUT
// ---------------------------------------------------------------------------

function DonutChart ({ data, height, gradient, showPointers, unit }: { data: PieDatum[], height: number, gradient: boolean, showPointers?: boolean, unit?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hovered, setHovered] = useState<{ slice: PieSlice, x: number, y: number } | null>(null)

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

  useEffect(() => {
    setHovered(current => {
      if (!current) return current
      const slice = slices.find(item => item.name === current.slice.name)
      if (!slice) return null
      return slice === current.slice ? current : {...current, slice}
    })
  }, [slices])

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

function PieTooltip ({ x, y, slice, unit }: { x: number, y: number, slice: PieSlice, unit?: string }) {
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
function polarToCartesian (cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = -angleDeg * RADIAN
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  }
}

function computeSlices (data: PieDatum[]): PieSlice[] {
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

function arcPath (cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number): string {
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

function PieTotal ({ items }: { items: PieDatum[] }) {
  return (
    <>
      <Text className='h2 no-margin padding-bottom-smaller'>{shortNumber(toListValuesTotal(items))}</Text>
      <Text>Total</Text>
    </>
  )
}

function PieReference ({ data, legends, height }: { data: PieDatum[], legends: PieChartLegends, height: number }) {
  // A cast, not a guard: `true` has no options, and reads every one as `undefined`, as it did.
  // `columns = 0` gives the checker a number: an absent count compared `> 0` as false already.
  const { bottom, columns = 0, background = true } = (legends || {}) as PieChartLegendOptions
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

function renderReferenceItem ({ name, color, value }: PieDatum) {
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

function dataNormalized (items: PieChartItem[], gradient: boolean, sorts: string[]): PieDatum[] {
  const paletteLen = colorsPalette.length
  const list = items.map(({ id, label, value }) => {
    const number = Number(value)
    // A cast, not a guard: `color` is assigned by `mapper` below, before anything reads it.
    return {
      name: String(id != null ? id : (label != null ? label : '')),
      gradient,
      value: Number.isFinite(number) && number >= 0 ? number : 0,
    } as PieDatum
  })
  const mapper = (item: PieDatum, i: number) => {
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

function donutPieCenterCoords ({ cx, cy, midAngle, innerRadius, outerRadius }: Pick<LabelProps, 'cx' | 'cy' | 'midAngle' | 'innerRadius' | 'outerRadius'>) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return { x, y }
}

function renderPercent ({ cx, cy, midAngle, innerRadius, outerRadius, percent, fill, color }: LabelProps) {
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

function renderPercentPointer ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent, fill, color }: LabelProps) {
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
