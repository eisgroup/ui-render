import React from 'react'
import classNames from '../utils/classNames'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/**
 * THE TABLE FAMILY — in-house since UPGRADE-PLAN §9.7-F1 step 1
 * =============================================================================
 * Seven components over the seven native table elements. This file used to wrap
 * `semantic-ui-react`'s `Table` and re-export its six subcomponents; §9.7-F1 step 1 replaced
 * that with the markup SUIR was producing, because that is all it was producing here —
 * Semantic's own table CSS is not loaded (`collections/table` is commented out in
 * `src/style/override/_semantic.less`), so every table style in the product is in-house LESS
 * and the only thing the dependency contributed was className composition.
 *
 * THE ONE CLASS CONTRACT THAT IS LOAD-BEARING: `ui` AND `table` ON THE ROOT
 * -----------------------------------------------------------------------------
 * `src/style/components/table.less` hangs EVERY cell's padding off `.ui.table`
 * (`.ui.table td > :not(.button)` / `th > :not(.button)`), so the root has to keep emitting
 * both tokens even though nothing "semantic" is loaded any more. Drop either one and every
 * table in the product loses its cell padding. `ui` first, `table` second-to-last, the
 * caller's `className` last — SUIR's order, kept so the 38-example DOM baseline shows no
 * change on any `<table>` element.
 *
 * WHY THE `class=""` ATTRIBUTES DISAPPEARED (deliberate, and the point of the exercise)
 * -----------------------------------------------------------------------------
 * SUIR ran its own `cx()` in every subcomponent and rendered `class=""` whenever the result
 * was empty, so `TableView` could not suppress it from outside: 24 `<tbody class="">`,
 * 94 `<tr class="">` and 199 `<td class="">` in the baseline were Semantic's, not ours.
 * `className || undefined` omits the attribute instead. Nothing selects on an empty class —
 * so this is markup removed, not behaviour changed.
 *
 * WHAT IS DELIBERATELY NOT IMPLEMENTED
 * -----------------------------------------------------------------------------
 * SUIR's `Table` handled 29 props and its `Table.Cell` 17. Two are kept (`inverted`,
 * `striped` — see below); the rest are gone because no call site and no meta in either
 * corpus passes them AND no loaded CSS selects on what they emit: `as`/`href` element
 * inference, `celled`, `collapsing`, `color`, `columns`, `compact`, `definition`, `fixed`,
 * `padded`, `attached`, `basic`, `selectable`, `singleLine`, `size`, `sortable`, `stackable`,
 * `structured`, `unstackable`, `textAlign`, `verticalAlign`, `width`, `fullWidth`, `sorted`,
 * the row/cell state modifiers (`active`/`disabled`/`error`/`negative`/`positive`/`warning`),
 * the `content`/`icon` shorthands, `cells`/`cellAs`, and the whole nil-children shorthand
 * engine (`headerRow`/`headerRows`/`renderBodyRow`/`tableData`/`footerRow`).
 * `docs/SUPPORTED-PROPS.md` carries the list with a reason per prop; the semver call is
 * recorded there and in the changelog. `verticalAlign` is the one worth naming here: SUIR
 * turned it into the classes `top aligned`, and NO loaded CSS selects on `aligned` (0
 * occurrences in `static/all.css` and in `src/style`), so reproducing it would have copied
 * dead markup. The two call sites that passed it were removed with it; a cell that really
 * needs to align does it the way the metas already do, with `style={{verticalAlign}}`.
 *
 * WHAT KEEPS WORKING WITHOUT ANY CODE HERE
 * -----------------------------------------------------------------------------
 * `style`, `colSpan`, `scope`, `id`, `data-*` and every event handler ride the rest spread
 * onto the element — exactly as before, because SUIR did not handle them either. There is no
 * `forwardRef`: nothing in `src` passes a ref to a table element (the only `ref` near a table
 * is `TableView`'s wrapper `<div>`), so a parameter the callers cannot fill was not added.
 *
 * @Note: no `React.memo` here on purpose. These are one-element components whose children
 *  change on every parent render, so memoising them would cost a props comparison per cell to
 *  save nothing. `View`/`Row` memoise because they are leaves of large static subtrees.
 */

/**
 * Props SUIR handled that this implementation deliberately does not (see the note above and
 * `docs/SUPPORTED-PROPS.md` for the reason per prop). They are stripped rather than left to ride
 * the rest spread, because a string-valued one lands on the element as a lowercase attribute —
 * `verticalAlign="top"` became `verticalalign="top"`, which is precisely the junk the DOM
 * contract's FIXED_MARKUP_JUNK tripwires exist to keep out. Stripping them silently would be
 * worse than either, though: a consumer whose meta still carries `celled` would never learn it
 * stopped doing anything. So: strip, and say so once per prop in development.
 */
const DROPPED_PROPS = ['as', 'href', 'celled', 'textAlign', 'verticalAlign', 'fixedHeader']

const warnedDropped = new Set()

function dropUnsupported (props, displayName) {
    const kept = {}
    Object.keys(props).forEach(key => {
        if (DROPPED_PROPS.indexOf(key) === -1) {
            kept[key] = props[key]
            return
        }
        // `process.env.NODE_ENV` is what the build replaces, so this whole branch is dead code
        // in a production bundle.
        if (process.env.NODE_ENV !== 'production' && !warnedDropped.has(displayName + '.' + key)) {
            warnedDropped.add(displayName + '.' + key)
            console.warn(
                `[ui-render] ${displayName}: \`${key}\` is no longer supported and is ignored.`
                + ' semantic-ui-react handled it; the in-house table does not, because nothing in'
                + ' the product or in any audited meta used it and no shipped CSS selects on what'
                + ' it emitted. See docs/SUPPORTED-PROPS.md for the replacement, if any.'
            )
        }
    })
    return kept
}

/**
 * One member of the table family: an element, plus `className`, plus a filtered rest spread.
 * Six of the seven are exactly this, so they share one implementation rather than six copies.
 *
 * DOM boundary: the spread lands on a real element, so `ENGINE_PROPS` and `FIELD_ONLY_PROPS`
 * both apply (see ./domProps.js). `Table.Cell` is the one that matters — `mapper.js` spreads a
 * meta node's whole rest bag onto it, unfiltered, which is a leak waiting for the first meta to
 * put `name` or `symbol` on a `TableCells` node. `FIELD_ONLY_PROPS` is safe to strip on ALL of
 * them because no member of this family renders a form control: the control is a CHILD with its
 * own props (`mapper.js` builds them from the merged node, `LocalDraftTableRow` from `common`),
 * and `TableView` reads `this.props.name` for its `FieldArray` decision before anything reaches
 * here.
 *
 * @param {String} Element - the native tag to render ('thead', 'tbody', 'tfoot', 'tr', 'th', 'td')
 * @param {String} displayName - React display name, for devtools and warning messages
 * @returns {Function} React Component
 */
function tablePart (Element, displayName) {
    const Part = ({ className, ...props }) => (
        // `|| undefined` omits the attribute rather than rendering class="" — see the note above.
        <Element className={className || undefined}
                 {...dropUnsupported(omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS), displayName)}/>
    )
    Part.displayName = displayName
    return Part
}

/**
 * Table - Pure Component.
 * Renders a native `<table>` whose className is always `ui <modifiers> table <className>`.
 *
 * @param {String} [className] - optional css class, appended last
 * @param {Boolean} [inverted] - dark colour scheme (`table:not(.as-layout).inverted` in table.less)
 * @param {Boolean} [striped] - zebra rows (`table.striped tr:nth-child(2n)` in table.less)
 * @param {*} props - other attributes to pass to `<table>`
 * @returns {Object} - React Component
 */
export default function Table ({
    className,
    inverted,
    striped,
    ...props
}) {
    // DOM boundary: this spread lands on a <table>, where `name` is not a valid attribute.
    // `TableView` filters too, and deliberately keeps doing so — its own test pins the root's
    // attribute set — but a second caller (`ErrorTable`) does not, so the filter belongs here.
    return <table
        // `ui` and `table` are NOT decoration: `.ui.table` is what gives every cell its padding.
        className={classNames('ui', { inverted, striped }, 'table', className)}
        {...dropUnsupported(omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS), 'Table')}
    />
}

Table.Header = tablePart('thead', 'TableHeader')
Table.HeaderCell = tablePart('th', 'TableHeaderCell')
Table.Row = tablePart('tr', 'TableRow')
Table.Cell = tablePart('td', 'TableCell')
Table.Body = tablePart('tbody', 'TableBody')
Table.Footer = tablePart('tfoot', 'TableFooter')
