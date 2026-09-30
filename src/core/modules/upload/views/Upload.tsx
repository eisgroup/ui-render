import classNames from '../../../utils/classNames'
import { ROUTE_HOME, UPLOAD as U } from '../../variables'
import React, { Fragment, memo, useContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import DropzoneJs from '../../../components/Dropzone'
import { type } from '../../../components'
import Icon from '../../../components/Icon'
import Loading from '../../../components/Loading'
import Row from '../../../components/Row'
import Text from '../../../components/Text'
import Tooltip from '../../../components/Tooltip'
import View from '../../../components/View'
import {
    get,
    hasListValue,
    interpolateString as parseString,
    isFunction,
    pluralize,
    shortNumber,
    SIZE_KB
} from '../../../utils'
import { _ } from '../translations'
import { Active } from '../../../utils'
import type { Translate } from '../../../utils/_envs'
import { AppContext } from '../../../contexts'

/** What `Dropzone` exposes through its ref (`useImperativeHandle` in Dropzone.js). */
export type DropzoneHandle = { open: () => void }
const Dropzone = DropzoneJs as unknown as React.ForwardRefExoticComponent<
    Record<string, unknown> & React.RefAttributes<DropzoneHandle>
>

/** What an upload route contributes when its props do not say (U.BY_ROUTE in modules/variables). */
type RouteDefaults = { fileTypes?: string, maxSize?: number }
/** The part of AppContext this view calls. */
type PopupContext = { setPopupState: (popup: { title: string, content: React.ReactNode }) => void }

export type UploadProps = {
    /** Upload file type, falls back to the route pathname; if given, renders embedded instead of as a modal route */
    fileType?: string | number
    /** Allowed file formats, e.g. ['jpg', 'png'] */
    formats?: string[]
    /** Maximum file size in bytes */
    maxSize?: number
    /** Callback(acceptedFiles, name, dropzone) on dropped files */
    onChange?: (files: File[], name: string | undefined, dropzone: DropzoneHandle | null) => void
    /** Callback when the close button is clicked (e.g. history.goBack()) */
    onClose?: (event: unknown) => void
    /** Callback on cancelled upload or drag leave */
    onBlur?: (...args: unknown[]) => void
    /** Callback on choosing a file or drag enter */
    onFocus?: (...args: unknown[]) => void
    loading?: boolean
    disabled?: boolean
    readonly?: boolean
    multiple?: boolean
    hasHeader?: boolean
    showTypes?: boolean
    round?: boolean
    label?: string
    labelOnHover?: string
    children?: React.ReactNode
    translate?: Translate
    name?: string
    title?: string
    className?: string
    classWrap?: string
    location?: { pathname?: string }
}

/**
 * Opt a synthetic event out of React 16's event pool so it survives past the current handler.
 * No-op on React 17+ (pooling removed) and on React 19, where `persist` no longer exists.
 *
 * Exported for its own unit test: the two negative branches are unreachable through the component,
 * because React always supplies an event and every React in the supported range except 19 carries
 * `persist`. Testing it directly covers them without a fourth React in the matrix.
 */
export function persistEvent (event: unknown) {
    const pooled = event as { persist?: unknown } | null | undefined
    if (pooled && typeof pooled.persist === 'function') pooled.persist()
}

// Read once, when this module loads, as the class's `defaultProps` were: `Active.translate` is reassigned by
// every document the engine constructs (rules.js), so a read at render would be a different default.
const DEFAULT_TRANSLATE = Active.translate

// The server runs no layout effect and React 16 and 17 warn when one is declared there; nothing below needs
// one on the server, where no drag can happen.
const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function Upload (props: UploadProps) {
    const {
        loading = false, children, multiple = true, disabled, readonly, onBlur, labelOnHover, onClose,
        className, classWrap, hasHeader, round, showTypes = true, title, translate = DEFAULT_TRANSLATE,
    } = props
    const context = useContext(AppContext) as unknown as PopupContext
    const [active, setActive] = useState(false)
    const dropzone = useRef<DropzoneHandle | null>(null)

    // The class told the host about a drag in `setState`'s callback: once the state it set was committed,
    // with the props of that commit, and even when the state was unchanged and PureComponent skipped the
    // render. A hook skips the commit then, so the callbacks queue here and a counter forces the commit
    // that runs them.
    const committedProps = useRef(props)
    const callbacks = useRef<Array<() => void>>([])
    const [, forceCommit] = useReducer((count: number) => count + 1, 0)
    useCommitEffect(() => {
        committedProps.current = props
        for (const callback of callbacks.current.splice(0)) callback()
    })
    const setActiveThen = (value: boolean, callback: () => void) => {
        callbacks.current.push(callback)
        setActive(value)
        forceCommit()
    }

    const uri = get(props, 'location.pathname', ROUTE_HOME) as string
    const fileType = props.fileType || (uri.split(/\//).pop() as string).toLowerCase()
    const byRoute = (U.BY_ROUTE as unknown as Record<string, RouteDefaults | undefined>)[fileType]
    const formats = props.formats ? `.${props.formats.join(', .')}` : (byRoute || {}).fileTypes
    const maxSize = props.maxSize || (byRoute || {}).maxSize

    // React 16 pools synthetic events and nulls their fields as soon as the handler returns, and these
    // callbacks run after the commit -- so on the declared 16.14 floor the host used to receive an event
    // whose `type` and `target` read `null`. persist() opts that event out of the pool on 16 and is a
    // harmless no-op on 17+, which stopped pooling; the guard covers React 19, where it is absent entirely.
    const onDragEnter = (event: unknown, ...rest: unknown[]) => {
        persistEvent(event)
        setActiveThen(true, () => committedProps.current.onFocus && committedProps.current.onFocus(event, ...rest))
    }

    const onDragLeave = (event: unknown, ...rest: unknown[]) => {
        persistEvent(event)
        setActiveThen(false, () => committedProps.current.onBlur && committedProps.current.onBlur(event, ...rest))
    }

    const handleUpload = (acceptedFiles: File[]) => {
        const { onChange, name } = props
        if (hasListValue(acceptedFiles)) {
            for (const file of acceptedFiles) {
                // A cast, not a guard: an absent `maxSize` compares false here, as it did in JavaScript.
                if (file.size > (maxSize as number)) {
                    context.setPopupState({
                        title: _.MAXIMUM_FILE_SIZE_EXCEEDED,
                        content: <Row className="center wrap">
                            <Text className="bold margin-h-smaller">{file.name}</Text>
                            <Text>{_.MUST_BE_UNDER}</Text>
                            <Text className="bold margin-h-smaller">{shortNumber(maxSize as number, 3, SIZE_KB)}B</Text>
                        </Row>
                    })
                    return
                }
            }
            isFunction(onChange) && onChange(acceptedFiles, name, dropzone.current)
        } else {
            context.setPopupState({
                title: _.FILE_UPLOAD_FAILED,
                content: <View className="center wrap">
                    <Text>{_.UPLOAD}</Text>
                    <Text className="p bold">{formats}</Text>
                    <Text>{_.FILES_ONLY}</Text>
                </View>
            })
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') (dropzone.current as DropzoneHandle).open()
    }

    const label = props.label || fileType || _.FILE
    return (
        <View className={classNames('app__upload', classWrap, { round })}>
            {onClose && (
                <View className="app__view--close" onClick={onClose}>
                    <Text className="app__view--close__icon">{'✕'}</Text>
                    <Tooltip top>{_.CLOSE}</Tooltip>
                </View>
            )}
            {hasHeader && <h2>{parseString(_.UPLOAD_file, { file: label })}</h2>}
            <Dropzone
                // @note: When tabbing to dropzone with keyboard, input[type="file"] also gets event -> causing open twice.
                //      => input is hidden by dropzone because it has ugly "Choose File" button
                // @note: `name` is deliberately NOT passed. It never reached the hidden
                //   <input type='file'> (that one takes `inputProps`), so it only landed on the
                //   wrapping <div> as an invalid attribute. The field name is reported to the
                //   host through onChange(files, name, dropzone) above.
                title={translate(title)}
                inputProps={{ tabIndex: -1 }}
                tabIndex={disabled || readonly ? -1 : 0}
                className={classNames('upload__dropzone', className, { active, round, disabled, readonly })}
                ref={dropzone}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={handleUpload}
                onFileDialogCancel={onBlur}
                onKeyPress={handleKeyPress}
                accept={formats}
                multiple={multiple}
                disabled={disabled || readonly}
            >
                {children || <Fragment>
                    <Icon name="image" className="text largest no-margin"/>
                    <Text className="p margin-top-smallest">
                        {_.SELECT_OR_DROP}<br/>
                        {pluralize(label as string, multiple ? 2 : 1)}
                    </Text>
                </Fragment>
                }
                {showTypes &&
                    <View className="dropzone__hover position-fill align-center appear-on-hover">
                        <View className="padding text-outline">
                            <View className="dropzone__hover__bg position-fill bg-neutral radius-large"/>
                            <Text className="margin-bottom-smaller">
                                {labelOnHover || parseString(_.UPLOAD_file_FILE, { file: label })}
                            </Text>
                            <Text className="bold p">{(formats as string).replace(/\./g, '')}</Text>
                        </View>
                    </View>
                }
            </Dropzone>
            <Loading loading={loading}/>
        </View>
    )
}

Upload.propTypes = {
    // Upload file type, falls back to Route pathname
    // If given, will render as embedded component, instead of Modal route
    fileType: type.OneOf(type.String, type.Number),
    /* Allowed file formats, example: ['jpg', 'png'] */
    formats: type.ListOf(type.String),
    /* Maximum File size in bytes */
    maxSize: type.Number,
    /* Callback(acceptedFiles, name) onDrop files */
    onChange: type.Method,
    /* Callback when close button is clicked (ex. history.goBack()) */
    onClose: type.Method,
    /* Callback when cancel upload or on drag leave */
    onBlur: type.Method,
    /* Callback when choose file or on drag enter */
    onFocus: type.Method,
    loading: type.Boolean,
    disabled: type.Boolean, // whether to disable upload
    readonly: type.Boolean, // whether to make upload viewable only
    multiple: type.Boolean, // whether to allow multiple file uploads, true by default
    hasHeader: type.Boolean, // whether to show title above the upload
    showTypes: type.Boolean, // whether to show file types tooltip
    round: type.Boolean, // whether to add `round` css class
    label: type.String, // optional label to show in the title
    labelOnHover: type.String, // optional label to show on Dropzone hover
    children: type.Any,
    translate: type.Method,
}

// `memo` skips a render with shallow-equal props, as `PureComponent` did.
export default memo(Upload)
