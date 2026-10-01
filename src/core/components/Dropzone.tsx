import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/** What `Dropzone` exposes through its ref. */
export type DropzoneHandle = {
  /** The hidden `<input type="file">`, once mounted */
  readonly fileInputEl: HTMLInputElement | null
  /** Opens the file dialog, unless disabled */
  open: () => void
}

/** The named props are read here; the rest is spread onto the wrapping `<div>` through ./domProps. */
export type DropzoneProps = {
  /** Comma-separated list of accepted formats (e.g. `.jpg, .png` or `image/*`) */
  accept?: string
  /** Allow selecting multiple files */
  multiple?: boolean
  /** Disable click and drop */
  disabled?: boolean
  /** Fires on drop or file dialog selection, with the files `accept` lets through */
  onDrop?: (acceptedFiles: File[]) => void
  /** Fires once when the first dragged file enters the zone */
  onDragEnter?: (event: React.DragEvent<HTMLDivElement>) => void
  /** Fires once when the last dragged file leaves the zone */
  onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void
  /** Fires when the user closes the file dialog without picking files */
  onFileDialogCancel?: () => void
  /** Extra props for the hidden `<input type="file">` */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  /** Css class for the wrapping element */
  className?: string
  /** Rendered inside the zone */
  children?: React.ReactNode
  [key: string]: unknown
}

/**
 * Drag & drop file zone built on the native File API. Replaces the small subset
 * of `react-dropzone` we use: a wrapping element that opens a hidden file input
 * on click, accepts drag&drop, and preserves the imperative API used by Upload:
 * `open()` plus the underlying `fileInputEl`.
 *
 * Typed by a cast at the end: `forwardRef`'s own type runs the props through `Omit<…, 'ref'>`, which
 * erases every named prop of a type with an index signature. This is the same component with them kept.
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
}: DropzoneProps, ref: React.ForwardedRef<DropzoneHandle>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  useImperativeHandle(ref, () => ({
    get fileInputEl () {
      return inputRef.current
    },
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    // Avoid recursive click when the synthetic click bubbles from the hidden input itself.
    if (e.target === inputRef.current) return
    inputRef.current && inputRef.current.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!disabled && files.length && onDrop) onDrop(filterByAccept(files, accept))
    // Reset so picking the same file again still triggers `change`.
    e.target.value = ''
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    dragCounter.current += 1
    if (dragCounter.current === 1 && onDragEnter) onDragEnter(e)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) {
      dragCounter.current = 0
      return
    }
    if (dragCounter.current === 0) return
    dragCounter.current -= 1
    if (dragCounter.current === 0 && onDragLeave) onDragLeave(e)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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
      {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)}
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
}) as React.ForwardRefExoticComponent<DropzoneProps & React.RefAttributes<DropzoneHandle>>

export default Dropzone

// Extensions whose spelling differs from the MIME subtype they map to.
const EXTENSION_TYPE_ALIASES: Record<string, string | undefined> = {jpg: 'jpeg', jpeg: 'jpg', tif: 'tiff', tiff: 'tif', htm: 'html', html: 'htm'}

/** Whether a browser-reported MIME type corresponds to an extension pattern such as `.jpeg` */
function typeMatchesExtension (type: string, extension: string) {
  const subtype = type.split('/')[1]
  if (!subtype) return false
  return subtype === extension || EXTENSION_TYPE_ALIASES[extension] === subtype
}

function filterByAccept (files: File[], accept?: string) {
  if (!accept) return files
  const patterns = String(accept).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (!patterns.length) return files
  return files.filter((file) => {
    const name = (file.name || '').toLowerCase()
    const type = (file.type || '').toLowerCase()
    return patterns.some((p) => {
      // An extension pattern also matches on MIME type, so `.jpeg` still accepts `photo.jpg` — or a
      // file with no extension at all — when the browser typed it as `image/jpeg`.
      if (p.startsWith('.')) return name.endsWith(p) || typeMatchesExtension(type, p.slice(1))
      if (p.endsWith('/*')) return type.startsWith(p.slice(0, -1))
      return type === p
    })
  })
}
