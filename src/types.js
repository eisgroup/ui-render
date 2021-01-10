import PropTypes from 'prop-types'

/**
 * PROPTYPES PROXY =============================================================
 * For clear semantic meaning without documentation
 * =============================================================================
 */

export const type = {}

/* Common types */
type.Any = PropTypes.any
type.Boolean = PropTypes.bool
type.Degree = PropTypes.number
type.Decimal = PropTypes.number // precision decimal points count
type.Enum = PropTypes.oneOf
type.File = PropTypes.object // File object
type.Float = PropTypes.number
type.Fraction = PropTypes.number // between 0 - 1
type.GetterString = PropTypes.string // Javascript getter function
type.Id = PropTypes.string
type.Int = PropTypes.number
type.List = PropTypes.array
type.ListOf = PropTypes.arrayOf
type.Method = PropTypes.func
type.Mm = PropTypes.number // millimeter
type.Number = PropTypes.number
type.Object = PropTypes.object
type.ObjectOf = PropTypes.objectOf
type.Of = PropTypes.shape
type.OneOf = (...types) => PropTypes.oneOfType(types)
type.Px = PropTypes.number // screen unit
type.String = PropTypes.string
type.Url = PropTypes.string
type.UrlOrBase64 = type.String
type.UrlOrNode = type.OneOf(type.String, type.Object, type.Method)
type.UrlOrObject = type.OneOf(type.String, type.Object)

/* Component Types */
type.Definition = type.Of({ // localised definition (example: LANGUAGE.ENGLISH object)
  _: type.Any.isRequired, // identifier code that is language agnostic
  name: type.GetterString.isRequired, // definition's `name` string for currently active Language
  en: type.String, // `name` string in English
  // 'ru': other definition's `name` strings by their language code
})
type.DefinitionSet = type.ObjectOf(type.Definition.isRequired) // set of localised definitions (example: LANGUAGE object)
type.Option = type.OneOf( // dropdown option
  type.String,
  type.Number,
  type.Of({
    value: type.Any.isRequired,
    text: type.String.isRequired,
    content: type.Any,
  }),
)
type.Options = type.ListOf(type.Option.isRequired)
type.FileInput = type.Of({
  i: type.Any, // identifier or index position of the file in the grid
  src: type.UrlOrBase64, // file source URL or base64 encoded string
  name: type.String, // file name with extension
  kind: type.Any, // type of file (example: public, private...)
  file: type.File, // -> sent by onChange callbacks for upload to backend (example: Dropzone file object)
  remove: type.Boolean, // -> sent by onChange callbacks for deletion to backend
})
