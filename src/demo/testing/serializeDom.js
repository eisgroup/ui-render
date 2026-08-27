/**
 * CANONICAL DOM SERIALISER ====================================================
 *
 * Test-support only. Turns a rendered subtree into a stable, line-per-node text
 * form for the full-DOM contract snapshots (UPGRADE-PLAN §9.5, layer 1).
 *
 * WHY NOT `container.innerHTML` OR pretty-format's DOMElement plugin
 * -----------------------------------------------------------------------------
 * Both serialise attributes in `element.attributes` order — the order React
 * happened to assign them in — and that order is a React implementation detail,
 * not part of the DOM contract. Measured on this example set: React 16.14, 17.0.2
 * and 18.3.1 agree byte-for-byte, but React 19.2.8 assigns `type` and `name` on
 * `<input>` last, which reorders the serialised attributes of 14 of the 38
 * examples while the element, its attribute set, every value and all text stay
 * identical. Sorting attribute names here makes the snapshot express what the
 * contract actually is — elements, attributes, values, text and tree shape — and
 * keeps one snapshot file valid on every React major the peer range covers.
 *
 * Attribute *values* are never reordered: class-token and style-declaration order
 * is authored by this library, so a change there is a real change to catch.
 * -----------------------------------------------------------------------------
 */

const INDENT = '  '

/** Void elements are written self-closing; nothing else is, so an empty <div> stays visible as a pair. */
const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
])

/**
 * JSON quoting rather than HTML escaping: it round-trips quotes, newlines and
 * non-printing characters unambiguously, so trailing whitespace in a text node
 * or a newline inside an attribute is visible in the snapshot diff instead of
 * being silently normalised away.
 */
const quote = value => JSON.stringify(String(value))

const serializeAttributes = element => Array.from(element.attributes)
    .map(({ name, value }) => [name, value])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, value]) => ` ${name}=${quote(value)}`)
    .join('')

const serializeNode = (node, depth, lines) => {
    const pad = INDENT.repeat(depth)

    if (node.nodeType === 3 /* Node.TEXT_NODE */) {
        // Whitespace-only text nodes are kept: React emits them deliberately and
        // losing them would hide a real change in rendered output.
        lines.push(`${pad}${quote(node.nodeValue)}`)
        return
    }

    if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
        lines.push(`${pad}<!--${quote(node.nodeValue)}-->`)
        return
    }

    if (node.nodeType !== 1 /* Node.ELEMENT_NODE */) {
        lines.push(`${pad}<?nodeType:${node.nodeType} ${quote(node.nodeValue || '')}?>`)
        return
    }

    const tag = node.tagName.toLowerCase()
    const attributes = serializeAttributes(node)
    const children = Array.from(node.childNodes)

    if (!children.length) {
        lines.push(`${pad}<${tag}${attributes}${VOID_ELEMENTS.has(tag) ? ' /' : ''}>`)
        if (!VOID_ELEMENTS.has(tag)) lines.push(`${pad}</${tag}>`)
        return
    }

    lines.push(`${pad}<${tag}${attributes}>`)
    children.forEach(child => serializeNode(child, depth + 1, lines))
    lines.push(`${pad}</${tag}>`)
}

/**
 * @param {Element} root - subtree owner; the root element itself is not emitted,
 *        only its children, so an RTL container div adds no noise.
 * @returns {String} canonical, newline-separated serialisation
 */
export const serializeDom = root => {
    const lines = []
    Array.from(root.childNodes).forEach(node => serializeNode(node, 0, lines))
    return lines.join('\n')
}

export default serializeDom
