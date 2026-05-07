const hasOwn = {}.hasOwnProperty

function toVal (mix) {
    let k
    let y
    let str = ''
    if (typeof mix === 'string' || typeof mix === 'number') {
        str += mix
    } else if (typeof mix === 'object' && mix != null) {
        if (Array.isArray(mix)) {
            for (k = 0; k < mix.length; k++) {
                if (mix[k]) {
                    y = toVal(mix[k])
                    if (y) {
                        if (str) str += ' '
                        str += y
                    }
                }
            }
        } else {
            for (k in mix) {
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
 * @param {...*} args
 * @returns {string}
 */
export default function classNames () {
    let i = 0
    let tmp
    let x
    let str = ''
    while (i < arguments.length) {
        tmp = arguments[i++]
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
