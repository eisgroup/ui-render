import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

/**
 * Drag & drop file zone built on the native File API. Replaces the small subset
 * of `react-dropzone` we use: a wrapping element that opens a hidden file input
 * on click, accepts drag&drop, and exposes an imperative `open()` method.
 *
 * @param {String} [accept] - comma-separated list of accepted formats (e.g. `.jpg, .png` or `image/*`)
 * @param {Boolean} [multiple] - allow selecting multiple files
 * @param {Boolean} [disabled] - disable click and drop
 * @param {Function} [onDrop] - (acceptedFiles: File[]) => void; fires on drop or file dialog selection
 * @param {Function} [onDragEnter] - fires once when the first dragged file enters the zone
 * @param {Function} [onDragLeave] - fires once when the last dragged file leaves the zone
 * @param {Function} [onFileDialogCancel] - fires when the user closes the file dialog without picking files
 * @param {Object} [inputProps] - extra props for the hidden `<input type="file">`
 * @param {String} [className] - css class for the wrapping element
 * @param {*} [children] - rendered inside the zone
 */
const Dropzone = forwardRef(function Dropzone ({
  accept,
  multiple = false,
  disabled = false,
  onDrop,
  onDragEnter,
  onDragLeave,
  onFileDialogCancel,
  inputProps = {},
  className,
  children,
  ...props
}, ref) {
  const inputRef = useRef(null)
  const dragCounter = useRef(0)

  useImperativeHandle(ref, () => ({
    open: () => {
      if (disabled || !inputRef.current) return
      inputRef.current.click()
    },
  }), [disabled])

  // Native `cancel` event fires when the user closes the file picker without selecting files.
  useEffect(() => {
    const input = inputRef.current
    if (!input || typeof onFileDialogCancel !== 'function') return
    const handler = () => onFileDialogCancel()
    input.addEventListener('cancel', handler)
    return () => input.removeEventListener('cancel', handler)
  }, [onFileDialogCancel])

  const handleClick = (e) => {
    if (disabled) return
    // Avoid recursive click when the synthetic click bubbles from the hidden input itself.
    if (e.target === inputRef.current) return
    inputRef.current && inputRef.current.click()
  }

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length && onDrop) onDrop(files)
    // Reset so picking the same file again still triggers `change`.
    e.target.value = ''
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (dragCounter.current === 1 && onDragEnter) onDragEnter(e)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = Math.max(0, dragCounter.current - 1)
    if (dragCounter.current === 0 && onDragLeave) onDragLeave(e)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    if (disabled) return
    const files = Array.from((e.dataTransfer && e.dataTransfer.files) || [])
    const accepted = filterByAccept(files, accept)
    if (onDrop) onDrop(accepted)
  }

  return (
    <div
      className={className}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      {...props}
    >
      <input
        type='file'
        ref={inputRef}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        {...inputProps}
      />
      {children}
    </div>
  )
})

export default Dropzone

function filterByAccept (files, accept) {
  if (!accept) return files
  const patterns = String(accept).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (!patterns.length) return files
  return files.filter((file) => {
    const name = (file.name || '').toLowerCase()
    const type = (file.type || '').toLowerCase()
    return patterns.some((p) => {
      if (p.startsWith('.')) return name.endsWith(p)
      if (p.endsWith('/*')) return type.startsWith(p.slice(0, -1))
      return type === p
    })
  })
}
