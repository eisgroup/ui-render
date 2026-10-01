import classNames from '../utils/classNames'
import React from 'react'
import Loading from './Loading'
import { Active } from '../utils'
import type { Translate } from '../utils/_envs'
import { ENGINE_PROPS, omitProps } from './domProps'

/** The named props are read here; the rest is spread onto the `<button>` through ./domProps (see `ViewProps`). */
export type ButtonProps = {
  /** Button click callback */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Button size, one of ['small', 'base', 'large'] */
  size?: string
  /** Button type, `button` by default */
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
  /** Optional, will be prepended with `button ` */
  className?: string
  /** Optional, whether the button is disabled */
  disabled?: boolean
  /** Optional, show spinner instead of children; also disables the button */
  loading?: boolean
  /** Whether to add `active` css class */
  active?: boolean
  /** Whether to add `circle` css class with even padding */
  circle?: boolean
  /** Whether to add `square` css class with even padding */
  square?: boolean
  /** Optional, content to be wrapped inside button `<button>{children}</button>`; a string is translated */
  children?: React.ReactNode
  translate?: Translate
  [key: string]: unknown
}

/**
 * Button - Pure Component.
 */
export function Button ({
  onClick,
  disabled = false,
  loading = false,
  active,
  circle,
  square,
  children,
  size,
  type = 'button',
  className,
  translate = Active.translate,
  ...props
}: ButtonProps) {
  // DOM boundary: ENGINE_PROPS only. `name` is a real attribute on <button> (form
  // submission), so FIELD_ONLY_PROPS is deliberately NOT applied — see ./domProps.ts.
  // This is what keeps a raw meta node's `view` off the button LocalDraftTableRow builds.
  const domProps = omitProps(props, ENGINE_PROPS)

  return (
    <button
      className={classNames('button', size, className, {circle, square, active, loading})}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      {...domProps}
    >
      {(typeof children === 'string') ? translate(children) : children}
      {loading && <Loading loading/>}
    </button>
  )
}

export default React.memo(Button)
