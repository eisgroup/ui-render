/**
 * THE DOM BOUNDARY
 * =============================================================================
 * The engine hands every rendered node the whole meta declaration *plus* its own
 * bookkeeping: `mapper.tsx`'s `RenderComponent` spreads what it does not consume onto
 * the resolved component, and `transforms.ts` builds the render-method options bag as
 * `{...props, ...definition, symbol, data, _data}` — the node's props plus the meta node
 * itself. Every presentational component then spreads what *it* does not destructure
 * onto a real DOM element, so any leftover key becomes an HTML attribute.
 *
 * Measured on the 38-example DOM baseline before this module existed: `view` (15),
 * `index` (8), `label` (6), `symbol` (23), `_comment` (2), `data` (40, serialised as
 * "[object Object]"), `_data` (40) and 108 of 165 `name` reached div/span/table/input/
 * button. All lowercase — and React emits no unknown-prop warning for a lowercase
 * attribute, so nothing in the console reports it.
 *
 * WHY A NAMED LIST INSTEAD OF ANOTHER DESTRUCTURE
 * -----------------------------------------------------------------------------
 * `expanded`, `translate`, `onDataChanged` and `currencyCode` were each fixed with
 * their own `foo: _` destructure in their own component, and the leak came back with
 * the next prop, because the fix lived in the component rather than at the boundary.
 * Adding a prop to the engine now means adding one string here, not auditing five
 * components — and the DOM-contract suite counts these markers at zero, so a
 * regression fails a test instead of shipping silently.
 *
 * TWO LISTS, AND THE SPLIT IS THE WHOLE POINT
 * -----------------------------------------------------------------------------
 * `name` is BOTH an engine-internal renderer selector AND the react-final-form field
 * registration path that a form control must carry on the DOM: `modules/form/utils.tsx`
 * registers `<Active.Field name=…>`, `InputNative` reports `onChange(value, name, event)`,
 * `Select` does the same, and `TableView` decides on `this.props.name` whether rows are
 * a `FieldArray` at all. `label` is what a field renders as its visible `<label>`
 * (`Input`, `Select`, `Dropdown`, `Checkbox` all consume it). A single denylist applied
 * everywhere would therefore delete `<input name>` and break every form silently.
 *
 *   ENGINE_PROPS      — strip at EVERY DOM boundary. Never a valid attribute on any
 *                       element this library renders.
 *   FIELD_ONLY_PROPS  — strip on generic containers (`div`, `span`, `table`, the upload
 *                       dropzone). KEEP on the form-control family (`Input`/`InputNative`/
 *                       `Select`/`Checkbox`), which is where they are real and load-bearing.
 *
 * WHERE THE LISTS ARE APPLIED (keep this list current)
 * -----------------------------------------------------------------------------
 *   ENGINE_PROPS + FIELD_ONLY_PROPS : Text (span), View (div), Row (div), Label (label),
 *                                     ScrollView (inner div), Dropzone (div),
 *                                     Table (table), Table.Header/Body/Footer/Row
 *                                     (thead/tbody/tfoot/tr), Table.HeaderCell (th),
 *                                     Table.Cell (td), TableView (again, before Table),
 *                                     Dropdown (props handed to `Listbox` -> div),
 *                                     Slider (div), Icon (i), Image (img), Tooltip (span)
 *   ENGINE_PROPS only               : InputNative (input/textarea, and Select -> select),
 *                                     Button (button), InputNumber (input), Checkbox (input),
 *                                     InputDate (rc-picker -> input)
 *
 * A component that spreads a props bag onto a DOM element without going through one of
 * those is a new boundary and needs the same treatment.
 *
 * HOW THIS LIST WAS ARRIVED AT, AND WHAT IS DELIBERATELY NOT IN IT
 * -----------------------------------------------------------------------------
 * The first eight sites were the ones the 38-example DOM baseline showed leaking. Review
 * then found that the corpus is not a sufficient audit: `Slider`, `Checkbox`, `InputNumber`,
 * `InputDate`, `Icon`, `Image` and `Tooltip` all leaked too, and none of it appeared in the
 * baseline simply because no example passes an engine prop to a slider or an icon. Those
 * seven were found by auditing every spread onto a DOM tag and probing each directly, which
 * is the method to repeat rather than re-reading the snapshots.
 *
 * `Table.Cell` was the last KNOWN-reachable gap: `mapper.tsx` spreads a `TableCells` node's whole
 * rest bag onto it, so the boundary closed with the in-house table family in §9.7-F1 step 1 —
 * applying both lists there was a zero-diff change on today's corpus (no example puts `name` or
 * `label` on such a node) and a real net for the first meta that does. Applying FIELD_ONLY_PROPS
 * across the whole family is safe because no member of it renders a form control: the control is
 * a CHILD with its own props, and `TableView` reads `this.props.name` for its `FieldArray`
 * decision before anything reaches a cell. The last unfiltered spread on the F1 surface was the
 * tooltip's, onto Semantic's `Popup`, and step 2 closed it: `Tooltip` applies both lists.
 *
 * Still uncovered, and why that is not the same as unsafe: two components spread onto a DOM
 * tag unfiltered, and no meta props bag reaches either. `AnimateHeight` gets only what `Expand`
 * passes it, and `LinkOut` renders only in the demo. (This paragraph also named seven orphans,
 * since deleted by §9.9-H1, and `utils/SizeMe`, deleted with the `utils/layouts.js` nothing
 * imported.) `Placeholder` spreads onto a component in this list rather than onto an element, so
 * it is filtered downstream; so did `ColorSwatch`, deleted with the dead renderers that drew it.
 * If `Placeholder` is ever wired into `mapper.tsx`, it becomes a boundary that day.
 */

/**
 * Engine-internal props. Not an HTML attribute on any element this library renders, so
 * they are stripped at every boundary. Several are still load-bearing as *props* — the
 * strip is at the DOM edge only:
 *   `view`         component selector, consumed by mapper.tsx's dispatch
 *   `index`        row index; `Expand.handleClick` and `Data` read it off their props
 *   `data`/`_data` the engine's global/local data bags
 *   `symbol`       currency symbol for the value renderers (`FIELD.RENDER.CURRENCY` reads it)
 *   `_comment`     author annotation; also dropped at source by `transforms.ts`
 *   `expanded`     `Expand` state hint
 *   `translate`    the i18n FUNCTION, not the HTML global attribute — the engine owns this
 *                  key (RenderComponent already strips it), and React warns on a function value
 *   `onDataChanged`/`currencyCode` engine callbacks/config
 *   `meta`         a node's own meta document, which `Data` and the draft row read; `PopupContent`
 *                  puts `{relativePath, relativeIndex}` on every popup item, so it reached the
 *                  popup's spans and inputs as `meta="[object Object]"`
 *   `@class`       producer metadata: OpenL's serializer tags every meta node with its bean class
 *                  (`'@class': 'org.openl.generated.beans.Text'`), and React rejects the name with
 *                  an "Invalid attribute name" warning on every node that carries it
 * @type {Array<String>}
 */
export const ENGINE_PROPS = [
    'view',
    'index',
    'data',
    '_data',
    'symbol',
    '_comment',
    'expanded',
    'translate',
    'onDataChanged',
    'currencyCode',
    'meta',
    '@class',
]

/**
 * Real, required attributes on a form control — and meaningless (or actively wrong) on a
 * generic container. Read the two-lists note above before touching this: `name` is the
 * form field registration path, and removing it from the control family breaks every form.
 * @type {Array<String>}
 */
export const FIELD_ONLY_PROPS = ['name', 'label']

/**
 * Shallow copy of `props` without the keys in the given lists.
 *
 * Returns the SAME object when no listed key is present, so a clean render — the common
 * case — allocates nothing. Callers may therefore only mutate the result when they own
 * the input (a destructuring rest object, which is fresh per render); `Row` does exactly
 * that to attach its forwarded `ref`.
 *
 * @Note: deliberately NOT `removeKeys` from `../utils/object` — its `clone` path runs
 *  cloneDeep, which on a props bag would deep-clone style objects, event handlers and
 *  React elements, and its default path mutates, which is illegal on props.
 *
 * The result is an open bag, `unknown` per key: it is forwarded to an element, never inspected.
 *
 * @param {Object} props - to filter, must not be nil
 * @param {...Array<String>} lists - key lists to remove (see ENGINE_PROPS, FIELD_ONLY_PROPS)
 * @returns {Object} props - without the listed keys, or the input object when none matched
 */
export function omitProps (props: Record<string, unknown>, ...lists: string[][]): Record<string, unknown> {
    const denied = lists.length === 1 ? lists[0] : ([] as string[]).concat(...lists)
    if (!denied.some(key => key in props)) return props
    const kept: Record<string, unknown> = {}
    Object.keys(props).forEach(key => {
        if (denied.indexOf(key) === -1) kept[key] = props[key]
    })
    return kept
}
