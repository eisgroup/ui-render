import classNames from '../../../utils/classNames'
import { ROUTE_HOME, UPLOAD as U } from '../../variables'
import type { UploadRouteDefaults } from '../../variables/files'
import React, { Fragment, memo, useContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import Dropzone from '../../../components/Dropzone'
import type { DropzoneHandle } from '../../../components/Dropzone'
import Icon from '../../../components/Icon'
import Loading from '../../../components/Loading'
import Row from '../../../components/Row'
import Text from '../../../components/Text'
import TooltipBubble from '../../../components/TooltipBubble'
import View from '../../../components/View'
import {
    get,
    hasListValue,
    isFunction,
    shortNumber,
    SIZE_KB,
    withDecimalSeparator,
} from '../../../utils'
import { _ } from '../translations'
import { Active } from '../../../utils'
import type { Translate } from '../../../utils/_envs'
import { alreadyTranslated, phrase, phraseMessage, phraseParts } from '../../../utils/phrases'
import type { BuiltInPhraseId } from '../../../utils/phrases'
import { AppContext, useNumberLocale } from '../../../contexts'

// Re-exported: `UploadProps.onChange` hands the handle to the host.
export type { DropzoneHandle }


export type UploadProps = {
    /** Upload file type, falls back to the route pathname; if given, renders embedded instead of as a modal route */
    fileType?: string | number
    /** Allowed file formats, e.g. ['jpg', 'png']; with neither these nor a known `fileType`, any file is accepted */
    formats?: string[]
    /** Maximum file size in bytes */
    maxSize?: number
    /** Callback(acceptedFiles, name, dropzone) on dropped files */
    onChange?: (files: File[], name: string | undefined, dropzone: DropzoneHandle | null) => void
    /** Callback when the close button is clicked (e.g. history.goBack()) */
    onClose?: (event: unknown) => void
    /** Callback on cancelled upload or drag leave */
    onBlur?: (...args: unknown[]) => void
    /** Callback when a drag enters the zone */
    onFocus?: (...args: unknown[]) => void
    loading?: boolean
    /** Whether to disable upload */
    disabled?: boolean
    /** Whether to make upload viewable only */
    readonly?: boolean
    /** Whether to allow multiple file uploads, true by default */
    multiple?: boolean
    /** Whether to show title above the upload: the built-in phrase `UPLOAD_FILE` */
    hasHeader?: boolean
    /** Whether to show file types tooltip, true by default */
    showTypes?: boolean
    /** Whether to add `round` css class */
    round?: boolean
    /** What it takes, as the title, the drop zone and the hover text name it; translated, and shown as it is given */
    label?: string
    /** Optional label to show on Dropzone hover, translated; the built-in phrase `UPLOAD_LABEL_FILE` or `UPLOAD_FILE` without one */
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
 *
 * Exported for its unit tests: no other module imports it.
 */
export function persistEvent (event: unknown) {
    const pooled = event as { persist?: unknown } | null | undefined
    if (pooled && typeof pooled.persist === 'function') pooled.persist()
}

// Read once, when this module loads, as the class's `defaultProps` were: `Active.translate` is reassigned by
// every document the engine constructs (rules.tsx), so a read at render would be a different default.
const DEFAULT_TRANSLATE = Active.translate

// The server runs no layout effect and React 16 and 17 warn when one is declared there; nothing below needs
// one on the server, where no drag can happen.
const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function Upload (props: UploadProps) {
    const {
        loading = false, children, multiple = true, disabled, readonly, onBlur, labelOnHover, onClose,
        className, classWrap, hasHeader, round, showTypes = true, title, translate = DEFAULT_TRANSLATE,
    } = props
    const context = useContext(AppContext)
    const locale = useNumberLocale()
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
    // What an upload route contributes when its props do not say; an unknown `fileType` has none.
    const byRoute: UploadRouteDefaults | undefined = U.BY_ROUTE[fileType]
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

    /**
     * The built-in phrase `id` as `Text`s, with an element of `values` in place of each of their placeholders: the
     * host's translation decides where each value goes. The popup shows them as they are.
     */
    const phraseTexts = (id: BuiltInPhraseId, values: Record<string, React.ReactElement>) => (
        phraseParts(translate, id, Object.keys(values)).map((part, index) => typeof part === 'string'
            ? <Text key={index} translate={alreadyTranslated}>{part}</Text>
            : React.cloneElement(values[part.placeholder], { key: index }))
    )

    // Its popups open with `isOpen`, which they lacked until 2026-10-23: the popup keeps its `isOpen` when it is not
    // given (`AppProvider`), so a refused drop handed it a title and a message and it stayed closed.
    const handleUpload = (acceptedFiles: File[]) => {
        const { onChange, name } = props
        if (hasListValue(acceptedFiles)) {
            for (const file of acceptedFiles) {
                // A cast, not a guard: an absent `maxSize` compares false here, as it did in JavaScript.
                if (file.size > (maxSize as number)) {
                    context.setPopupState({
                        isOpen: true,
                        title: phraseMessage('MAXIMUM_FILE_SIZE_EXCEEDED'),
                        content: <Row className="center wrap">
                            {phraseTexts('FILE_MUST_BE_UNDER', {
                                file: <Text className="bold margin-h-smaller">{file.name}</Text>,
                                size: <Text className="bold margin-h-smaller">{withDecimalSeparator(shortNumber(maxSize as number, 3, SIZE_KB), locale)}B</Text>,
                            })}
                        </Row>
                    })
                    return
                }
            }
            isFunction(onChange) && onChange(acceptedFiles, name, dropzone.current)
        } else {
            context.setPopupState({
                isOpen: true,
                title: phraseMessage('FILE_UPLOAD_FAILED'),
                content: <View className="center wrap">
                    {phraseTexts('UPLOAD_FILES_ONLY', { formats: <Text className="p bold">{formats}</Text> })}
                </View>
            })
        }
    }

    // What it takes, as the host names it: translated, and shown as it is given. Until 2026-10-23 the drop zone put
    // it in the English plural where the upload takes several files, which made nonsense of a translated label.
    const given = props.label || fileType
    const named = given ? String(translate(given)) : undefined
    // The built-in phrase for what it takes, where the host names nothing.
    const fileWord = () => phrase(translate, 'FILE')
    return (
        <View className={classNames('app__upload', classWrap, { round })}>
            {onClose && (
                <View className="app__view--close" onClick={onClose}>
                    <Text className="app__view--close__icon">{'✕'}</Text>
                    <TooltipBubble top>{_.CLOSE}</TooltipBubble>
                </View>
            )}
            {hasHeader && <h2>{phrase(translate, 'UPLOAD_FILE', { file: named || fileWord() })}</h2>}
            <Dropzone
                // @note: When tabbing to dropzone with keyboard, input[type="file"] also gets event -> causing open twice.
                //      => input is hidden by dropzone because it has ugly "Choose File" button
                // @note: `name` is deliberately NOT passed. It never reached the hidden
                //   <input type='file'> (that one takes `inputProps`), so it only landed on the
                //   wrapping <div> as an invalid attribute. The field name is reported to the
                //   host through onChange(files, name, dropzone) above.
                // The zone is the button the keyboard reaches, and opens the dialog itself (Dropzone):
                //   this passed a `keypress` handler for Enter until 2026-10-06.
                title={translate(title)}
                inputProps={{ tabIndex: -1 }}
                className={classNames('upload__dropzone', className, { active, round, disabled, readonly })}
                ref={dropzone}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={handleUpload}
                onFileDialogCancel={onBlur}
                accept={formats}
                multiple={multiple}
                disabled={disabled || readonly}
            >
                {children || <Fragment>
                    <Icon name="image" className="text largest no-margin"/>
                    <Text className="p margin-top-smallest">
                        {phrase(translate, 'SELECT_OR_DROP')}<br/>
                        {named || (multiple ? phrase(translate, 'FILES') : fileWord())}
                    </Text>
                </Fragment>
                }
                {showTypes &&
                    <View className="dropzone__hover position-fill align-center appear-on-hover">
                        <View className="padding text-outline">
                            <View className="dropzone__hover__bg position-fill bg-neutral radius-large"/>
                            {/* Until 2026-10-23 an upload the host named nothing read "Upload File File" here. */}
                            <Text className="margin-bottom-smaller" translate={alreadyTranslated}>
                                {labelOnHover
                                    ? translate(labelOnHover)
                                    : (named
                                        ? phrase(translate, 'UPLOAD_LABEL_FILE', { label: named })
                                        : phrase(translate, 'UPLOAD_FILE', { file: fileWord() }))}
                            </Text>
                            {/* Without `formats` or a known `fileType` any file is accepted: no types to list. */}
                            {formats && <Text className="bold p">{formats.replace(/\./g, '')}</Text>}
                        </View>
                    </View>
                }
            </Dropzone>
            <Loading loading={loading}/>
        </View>
    )
}

// `memo` skips a render with shallow-equal props, as `PureComponent` did.
export default memo(Upload)
