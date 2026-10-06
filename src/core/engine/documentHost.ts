/**
 * A DOCUMENT'S INSTANCE, HOSTED BY A FUNCTION COMPONENT (§9.3 step 6, slice 6).
 * =============================================================================================
 *
 * The engine's document is three classes, one over another: the declared `UIRender`, the engine
 * layer and the form layer. Every node a document renders is handed its instance as `instance`, and
 * reads and calls members of it (`rules.instance-contract.test.js` pins which). What had to go was
 * React's CLASS COMPONENT, not that instance. Its last two `UNSAFE_componentWillReceiveProps` could
 * not become `getDerivedStateFromProps`, which cannot see the form, and a class that has one of the
 * two gets none of its `UNSAFE_*` lifecycles called.
 *
 * So the classes stay, as the classes of the instance, and React is handed a function component
 * that hosts one instance for the document's lifetime. The host gives the instance what React gave
 * it:
 *  - `props`, `state` and `context`, written before every render;
 *  - `setState(partial | updater, callback)` and `forceUpdate(callback)`, from `DocumentInstance`:
 *    applied in order when the document renders, an updater called with the state and the props
 *    of that render, and the callback run once that render is committed;
 *  - `componentDidMount`, `componentDidUpdate(prevProps, prevState)` and `componentWillUnmount`,
 *    from layout effects, which run where React ran them: in the commit, before the paint;
 *  - and `render()`, for the output.
 *
 * And one method React classes do not have: `deriveFromProps(nextProps)`. The host calls it during
 * the render when the props object or the context changed, while `this.props`, `this.state` and
 * `this.context` are still what the last render had: where and when React called
 * `UNSAFE_componentWillReceiveProps`. It may set the document's own state, which React applies
 * before the render goes on. It must not reach outside the document, because a render may run twice
 * or be thrown away, and StrictMode runs it twice: what it owes the outside, the instance does in
 * `componentDidUpdate`.
 *
 * `documentHost.test.js` runs one script through a React class and through the host and pins that
 * both do the same thing, on React 16, 17 and 18, and under StrictMode. One difference is
 * deliberate: an update that changes nothing renders again, where React skipped the render and
 * still called back after the commit. The engine makes no such update.
 */
import { createContext, useContext, useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import type { Context, Dispatch, FunctionComponent, ReactNode } from 'react'

export type DocumentState = Record<string, any>
type StateUpdate = DocumentState | null | undefined
type StateUpdater = (state: DocumentState, props: any) => StateUpdate
type Callback = () => void
type Enqueue = (update: StateUpdate | StateUpdater, callback?: Callback) => void

/** How an instance's `setState` reaches its host. Weak, so an unmounted document leaves nothing. */
const enqueueByInstance = new WeakMap<object, Enqueue>()

/**
 * What the engine's classes extend in place of `React.Component`. Only `setState` and `forceUpdate`
 * live here: the host writes `props`, `state` and `context`. They are declared by the interface
 * below rather than as class fields, so no instance gets an own `state` before its constructor chain
 * builds one.
 */
export interface DocumentInstance<P = any> {
    props: P
    state: DocumentState
    context: any
}
export class DocumentInstance<P = any> {
    constructor (props: P) {
        this.props = props
    }

    setState (update: StateUpdate | StateUpdater, callback?: Callback): void {
        if (update != null && typeof update !== 'object' && typeof update !== 'function') {
            // React's own wording, so a caller sees the same message it saw from the class.
            throw new Error('setState(...): takes an object of state variables to update or a function which returns an object of state variables.')
        }
        enqueue(this, update, callback)
    }

    forceUpdate (callback?: Callback): void {
        enqueue(this, null, callback)
    }
}

function enqueue (instance: object, update: StateUpdate | StateUpdater, callback?: Callback): void {
    const toHost = enqueueByInstance.get(instance)
    if (toHost) {
        toHost(update, callback)
    } else {
        console.error('Warning: setState was called on a document instance before its host rendered it. The update was dropped.')
    }
}

/** An instance the host can render: `DocumentInstance` with the methods React calls, all optional. */
export interface Hosted<P> extends DocumentInstance<P> {
    render (): ReactNode
    deriveFromProps? (nextProps: P): void
    componentDidMount? (): void
    componentDidUpdate? (prevProps: P, prevState: DocumentState): void
    componentWillUnmount? (): void
}

export interface HostedClass<P> {
    new (props: P): Hosted<P>
    readonly name: string
    contextType?: Context<any>
}

/** The function component `hostDocument` returns, with the class it hosts. */
export type HostComponent<P> = FunctionComponent<P> & { InstanceClass: HostedClass<P> }

/** One document's bookkeeping, for its whole lifetime. */
type Host<P> = {
    instance: Hosted<P>
    /** The props of the render in progress, for updaters, as React hands them the next props. */
    latestProps: P
    /** What the last commit had: `componentDidUpdate`'s arguments, and what a derivation sees. */
    committedProps: P | undefined
    committedState: DocumentState | undefined
    /** Callbacks of updates not yet rendered, then of the updates the render in progress applies. */
    queued: Callback[]
    committing: Callback[]
    dispatch: Dispatch<Action> | null
}

/**
 * The React state behind a document: its state, and the props it was last derived from. The second
 * is state, not a ref, on purpose: a render may run twice or be thrown away, and React drops the
 * updates of a render it throws away, so whether to derive has to be read from what React kept.
 */
type Box = { host: Host<any>, state: DocumentState, derivedFrom: Derived }
type Derived = { props: unknown, context: unknown }
type Action = { update: StateUpdate | StateUpdater } | { derivedFrom: Derived }

/** Always a new box, as a class's `setState` always renders again, even when nothing changed. */
function apply (box: Box, action: Action): Box {
    if ('derivedFrom' in action) return { ...box, derivedFrom: action.derivedFrom }
    const { update } = action
    // A state is a plain object, so a function can only be an updater.
    const resolved = typeof update === 'function'
        ? (update as StateUpdater).call(box.host.instance, box.state, box.host.latestProps)
        : update as StateUpdate
    return { ...box, state: resolved == null ? box.state : Object.assign({}, box.state, resolved) }
}

function initialBox (host: Host<any>): Box {
    return { host, state: host.instance.state, derivedFrom: { props: host.latestProps, context: host.instance.context } }
}

/** For a class with no `contextType`, which React hands no context either. */
const NoContext = createContext<any>(undefined)

// Before the paint, as React ran a class's lifecycles. On the server it is a plain effect, which
// never runs, as the lifecycles did not: a layout effect there only warns (see `InputNative`).
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * The function component that hosts one instance of `InstanceClass` per mounted document. It carries
 * the class's name, so React's warnings and component stacks name the same component.
 */
export function hostDocument<P extends object> (InstanceClass: HostedClass<P>): HostComponent<P> {
    const contextType = InstanceClass.contextType || NoContext

    function Document (props: P): ReactNode {
        const context = useContext(contextType)
        const self = useRef<Host<P> | null>(null)
        if (self.current === null) {
            const instance = new InstanceClass(props)
            instance.context = context
            const host: Host<P> = {
                instance,
                latestProps: props,
                committedProps: undefined,
                committedState: undefined,
                queued: [],
                committing: [],
                dispatch: null,
            }
            enqueueByInstance.set(instance, (update, callback) => {
                if (callback) host.queued.push(callback)
                if (host.dispatch) host.dispatch({ update })
            })
            self.current = host
        }
        const host = self.current
        host.latestProps = props
        const [box, dispatch] = useReducer(apply, host, initialBox)
        host.dispatch = dispatch
        const { instance } = host

        // New props or context: derive from them first, with what the last render had.
        let derived = false
        const { derivedFrom } = box
        if (instance.deriveFromProps && (derivedFrom.props !== props || derivedFrom.context !== context)) {
            instance.props = derivedFrom.props as P
            instance.context = derivedFrom.context
            instance.state = host.committedState !== undefined ? host.committedState : box.state
            instance.deriveFromProps(props)
            dispatch({ derivedFrom: { props, context } })
            derived = true
        }
        instance.context = context
        instance.props = props
        instance.state = box.state
        // The callbacks of the updates this render applies run once it is committed.
        host.committing.push(...host.queued.splice(0))
        const mounting = host.committedProps === undefined

        useBeforePaintEffect(() => {
            // The document's for its lifetime: made once, in the ref, by the first render.
            const mounted = self.current!.instance
            if (mounted.componentDidMount) mounted.componentDidMount()
            return () => {
                if (mounted.componentWillUnmount) mounted.componentWillUnmount()
            }
        }, [])
        useBeforePaintEffect(() => {
            if (!mounting && instance.componentDidUpdate) {
                instance.componentDidUpdate(host.committedProps as P, host.committedState as DocumentState)
            }
            host.committedProps = props
            host.committedState = box.state
            for (const callback of host.committing.splice(0)) callback.call(instance)
        })

        // A derivation scheduled an update, so React throws this output away and renders again with
        // it. Rendering the instance for nothing would run its render twice where the class ran once.
        return derived ? null : instance.render()
    }

    // Named after the class, as `displayName` is: React's messages read `displayName`, and the
    // frames of its component stacks read the function's `name`. So both still name the component
    // the class was, `UIRenderLifecycleWithFormSetup` for the engine.
    Object.defineProperty(Document, 'name', { value: InstanceClass.name })
    const component = Document as HostComponent<P>
    component.displayName = InstanceClass.name
    component.InstanceClass = InstanceClass
    return component
}
