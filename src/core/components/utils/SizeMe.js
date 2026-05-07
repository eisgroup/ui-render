import React, { useEffect, useRef, useState } from 'react'

/**
 * Drop-in replacement for the `SizeMe` component from `react-sizeme` that uses ResizeObserver.
 * Wraps children in a block-level div, observes its size, and calls the render-prop with
 * `{ size: { width, height } }`. Width and height are `undefined` until first measurement.
 *
 * @param {boolean} [monitorWidth=true] - whether to report width changes
 * @param {boolean} [monitorHeight=false] - whether to report height changes
 * @param {Function} children - render prop ({ size }) => ReactNode
 */
export function SizeMe ({ monitorWidth = true, monitorHeight = false, children, ...rest }) {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: undefined, height: undefined })

  useEffect(() => {
    const node = ref.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize((prev) => {
        const nextW = monitorWidth ? width : prev.width
        const nextH = monitorHeight ? height : prev.height
        if (prev.width === nextW && prev.height === nextH) return prev
        return { width: nextW, height: nextH }
      })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [monitorWidth, monitorHeight])

  return (
    <div ref={ref} {...rest}>
      {typeof children === 'function' ? children({ size }) : children}
    </div>
  )
}

export default SizeMe
