const hasOwn = {}.hasOwnProperty

/** A dictionary whose truthy keys become class names. Values may be anything — only truthiness is read. */
export interface ClassDictionary {
    [key: string]: unknown
}

/** Anything `classNames()` accepts, including nested arrays. */
export type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassValue[]

function toVal (mix: ClassValue): string {
    let str = ''
    if (typeof mix === 'string' || typeof mix === 'number') {
        str += mix
    } else if (typeof mix === 'object' && mix != null) {
        if (Array.isArray(mix)) {
            for (let k = 0; k < mix.length; k++) {
                if (mix[k]) {
                    const y = toVal(mix[k])
                    if (y) {
                        if (str) str += ' '
                        str += y
                    }
                }
            }
        } else {
            for (const k in mix) {
                if (hasOwn.call(mix, k) && mix[k]) {
                    if (str) str += ' '
                    str += k
                }
            }
        }
    }
    return str
}

/**
 * Join class names (subset of the `classnames` package API).
 */
export default function classNames (...args: ClassValue[]): string {
    let i = 0
    let tmp: ClassValue
    let x: string
    let str = ''
    while (i < args.length) {
        tmp = args[i++]
        if (tmp) {
            x = toVal(tmp)
            if (x) {
                if (str) str += ' '
                str += x
            }
        }
    }
    return str
}
