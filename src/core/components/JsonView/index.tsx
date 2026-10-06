import classNames from '../../utils/classNames'
import React, { useMemo, useState } from 'react'
import View from '../View'
import defaultTheme from './themes'
import type { Base16Theme } from './themes'

/** A node's path from itself up to the root: its own key first. */
type KeyPath = Array<string | number>
/** Whether a node starts expanded. */
export type JsonViewExpandPredicate = (keyPath: KeyPath, value: unknown, level: number) => boolean
/** The colors a tree is drawn in, picked from a base16 theme. */
type Palette = Record<'background' | 'text' | 'muted' | 'key' | 'bracket' | 'string' | 'number' | 'boolean' | 'null' | 'error', string>

/** The named props are read here; the rest is passed to the `View` it renders. */
export type JsonViewProps = {
  data: unknown
  inverted?: boolean
  expanded?: boolean
  hideRoot?: boolean
  theme?: Base16Theme
  shouldExpandNode?: JsonViewExpandPredicate
  className?: string
  style?: React.CSSProperties
  fill?: boolean
  [key: string]: unknown
}

/**
 * Json nested Object Renderer (collapsible tree).
 *
 * @param {Object|Array} data - collection to render
 * @param {Boolean} [inverted] - whether to use the dark theme; when false (default), the theme is inverted to light
 * @param {Boolean} [expanded] - whether to expand all nested nodes by default
 * @param {Boolean} [hideRoot] - whether to hide the root brackets and render children directly
 * @param {Object} [theme] - base16 color definitions (see themes.ts)
 * @param {Function} [shouldExpandNode] - (keyPath, value, level) => boolean; default opens 1st level
 * @param {String} [className] - css class name
 * @param {Object} [style] - css styles
 * @param {Boolean} [fill] - fill available space
 */
export function JsonView ({
  data = {},
  inverted = false,
  expanded = false,
  hideRoot = true,
  theme = defaultTheme,
  shouldExpandNode,
  className,
  style,
  fill,
  ...props
}: JsonViewProps) {
  const palette = useMemo(() => buildPalette(theme, !inverted), [theme, inverted])
  const expandPredicate = useMemo(() => {
    if (typeof shouldExpandNode === 'function') return shouldExpandNode
    if (expanded) return () => true
    return (_keyPath: KeyPath, _value: unknown, level: number) => level === 0
  }, [expanded, shouldExpandNode])

  return (
    <View
      className={classNames('json-tree', className, { fill })}
      style={{
        background: palette.background,
        color: palette.text,
        fontFamily: 'monospace',
        fontSize: 13,
        padding: hideRoot ? 8 : 0,
        ...style,
      }}
      {...props}
    >
      <Node
        value={data}
        keyPath={['root']}
        level={0}
        palette={palette}
        shouldExpandNode={expandPredicate}
        hideKey
        hideRoot={hideRoot}
        ancestors={[]}
      />
    </View>
  )
}

export default React.memo(JsonView)

// ---------------------------------------------------------------------------
// NODE RENDERER
// ---------------------------------------------------------------------------

type NodeProps = {
  value: unknown
  keyPath: KeyPath
  level: number
  palette: Palette
  shouldExpandNode: JsonViewExpandPredicate
  hideKey?: boolean
  hideRoot?: boolean
  ancestors: unknown[]
}

function Node ({ value, keyPath, level, palette, shouldExpandNode, hideKey, hideRoot, ancestors }: NodeProps) {
  const isArr = Array.isArray(value)
  const isObj = value !== null && typeof value === 'object' && !isArr

  if (!isArr && !isObj) {
    return (
      <Row hideKey={hideKey} keyName={keyPath[0]} palette={palette}>
        <Primitive value={value} palette={palette}/>
      </Row>
    )
  }

  // Cycle = the value appears in its own ancestor chain. Sibling/repeated references are fine.
  if (ancestors.indexOf(value) !== -1) {
    return (
      <Row hideKey={hideKey} keyName={keyPath[0]} palette={palette}>
        <span style={{ color: palette.error }}>[Circular]</span>
      </Row>
    )
  }

  return (
    <Collection
      value={value}
      keyPath={keyPath}
      level={level}
      palette={palette}
      shouldExpandNode={shouldExpandNode}
      hideKey={hideKey}
      hideRoot={hideRoot && level === 0}
      ancestors={ancestors}
      isArr={isArr}
    />
  )
}

function Collection ({ value, keyPath, level, palette, shouldExpandNode, hideKey, hideRoot, ancestors, isArr }: NodeProps & { isArr: boolean }) {
  const initialOpen = hideRoot || shouldExpandNode(keyPath, value, level)
  const [open, setOpen] = useState(initialOpen)

  // Casts: `isArr` is what `Node` measured the value to be.
  const entries: Array<[string | number, unknown]> = isArr
    ? (value as unknown[]).map((v, i) => [i, v])
    : Object.keys(value as object).map((k) => [k, (value as Record<string, unknown>)[k]])
  const count = entries.length
  const open$ = isArr ? '[' : '{'
  const close$ = isArr ? ']' : '}'
  const childAncestors = [...ancestors, value]

  if (hideRoot) {
    return (
      <div>
        {entries.map(([k, v]) => (
          <Node
            key={k}
            value={v}
            keyPath={[k, ...keyPath]}
            level={level + 1}
            palette={palette}
            shouldExpandNode={shouldExpandNode}
            ancestors={childAncestors}
          />
        ))}
      </div>
    )
  }

  const summary = isArr
    ? `${count} item${count === 1 ? '' : 's'}`
    : `${count} ${count === 1 ? 'key' : 'keys'}`

  return (
    <div>
      <Row
        hideKey={hideKey}
        keyName={keyPath[0]}
        palette={palette}
        clickable
        onClick={() => setOpen(!open)}
      >
        <Triangle open={open} color={palette.muted} />
        <span style={{ color: palette.bracket }}>{open$}</span>
        {!open && (
          <>
            <span style={{ color: palette.muted, margin: '0 6px' }}>{summary}</span>
            <span style={{ color: palette.bracket }}>{close$}</span>
          </>
        )}
      </Row>
      {open && (
        <div style={{ paddingLeft: 16 }}>
          {entries.map(([k, v]) => (
            <Node
              key={k}
              value={v}
              keyPath={[k, ...keyPath]}
              level={level + 1}
              palette={palette}
              shouldExpandNode={shouldExpandNode}
              ancestors={childAncestors}
            />
          ))}
        </div>
      )}
      {open && (
        <Row hideKey palette={palette}>
          <span style={{ color: palette.bracket }}>{close$}</span>
        </Row>
      )}
    </div>
  )
}

type RowProps = {
  hideKey?: boolean
  keyName?: string | number
  palette: Palette
  clickable?: boolean
  onClick?: () => void
  children?: React.ReactNode
}

function Row ({ hideKey, keyName, palette, clickable, onClick, children }: RowProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        cursor: clickable ? 'pointer' : 'default',
        userSelect: 'none',
        lineHeight: '20px',
      }}
    >
      {!hideKey && (
        <>
          <span style={{ color: palette.key }}>{keyName}</span>
          <span style={{ color: palette.muted, margin: '0 6px' }}>:</span>
        </>
      )}
      {children}
    </div>
  )
}

function Triangle ({ open, color }: { open: boolean, color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        marginRight: 4,
        color,
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 120ms',
      }}
    >
      ▶
    </span>
  )
}

function Primitive ({ value, palette }: { value: unknown, palette: Palette }) {
  if (value === null) return <span style={{ color: palette.null }}>null</span>
  if (value === undefined) return <span style={{ color: palette.null }}>undefined</span>
  switch (typeof value) {
    case 'number':
      return <span style={{ color: palette.number }}>{String(value)}</span>
    case 'boolean':
      return <span style={{ color: palette.boolean }}>{String(value)}</span>
    case 'string':
      return <span style={{ color: palette.string }}>"{value}"</span>
    case 'function':
      return <span style={{ color: palette.muted }}>function {value.name || ''}()</span>
    default:
      return <span>{String(value)}</span>
  }
}

// ---------------------------------------------------------------------------
// PALETTE
// ---------------------------------------------------------------------------

// Base16 keys (matches existing themes.ts shape):
//   base00 background, base03 muted, base05 text,
//   base09 numbers/booleans, base0B strings, base0D bracket/key, base08 errors
function buildPalette (theme: Base16Theme, invert: boolean): Palette {
  const t = invert ? invertTheme(theme) : theme
  return {
    background: t.base00,
    text: t.base05,
    muted: t.base03,
    key: t.base0D,
    bracket: t.base0E,
    string: t.base0B,
    number: t.base09,
    boolean: t.base09,
    null: t.base08,
    error: t.base08,
  }
}

function invertTheme (theme: Base16Theme): Base16Theme {
  // Swap light/dark slots: base00↔base07, base01↔base06, base02↔base05, base03↔base04.
  // Hue slots (base08..base0F) are kept; this matches react-json-tree's invertTheme.
  return {
    ...theme,
    base00: theme.base07,
    base01: theme.base06,
    base02: theme.base05,
    base03: theme.base04,
    base04: theme.base03,
    base05: theme.base02,
    base06: theme.base01,
    base07: theme.base00,
  }
}
