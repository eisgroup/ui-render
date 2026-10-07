import React from 'react'
import type { Translate } from '../utils/_envs'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/** The named props are read here; the rest is spread onto the `<label>` through ./domProps (see `ViewProps`). */
export type LabelProps = {
  /** Optional, content to be wrapped inside `<label>{children}</label>`; a string is translated */
  children?: React.ReactNode
  /** What translates a string child; without it the child renders as it is */
  translate?: Translate
  [key: string]: unknown
}

/**
 * Label - Pure Component.
 * Abstraction layer for React Web
 */
function Label ({
  children,
  translate,
  ...props
}: LabelProps) {
  const child = (typeof children === 'string' && typeof translate === 'function') ? translate(children) : children
  // DOM boundary: <label> takes neither `name` nor a `label` attribute, and the mapper's
  // LABEL view spreads a whole meta node here. See ./domProps.ts.
  return <label {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)}>{child}</label>
}

export default React.memo(Label)
