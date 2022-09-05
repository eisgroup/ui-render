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
type.Milliseconds = PropTypes.number
type.Mm = PropTypes.number // millimeter
type.Node = PropTypes.object
type.Number = PropTypes.number
type.NumberOrString = PropTypes.oneOfType([PropTypes.string, PropTypes.number])
type.Object = PropTypes.object
type.ObjectOf = PropTypes.objectOf
type.Of = PropTypes.shape
type.OneOf = (...types) => PropTypes.oneOfType(types)
type.Promise = PropTypes.shape({
  then: PropTypes.func.isRequired,
  catch: PropTypes.func.isRequired
})
type.Px = PropTypes.number // screen unit
type.PrimitiveOrObject = PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]) // tooltip prop
type.String = PropTypes.string
type.StringOrNumber = PropTypes.oneOfType([PropTypes.string, PropTypes.number])
type.Timestamp = PropTypes.number
type.Url = PropTypes.string
type.UrlOrBase64 = type.String
type.UrlOrBase64OrPreview = type.OneOf(type.String, type.Object) // `preview` is new String() object
type.UrlOrNode = type.OneOf(type.String, type.Object, type.Method)
type.UrlOrObject = type.OneOf(type.String, type.Object)

/* Component Types */

// localised definition (example: LANGUAGE.ENGLISH object)
type.Definition = type.Of({
  _: type.Any.isRequired, // identifier code that is language agnostic
  name: type.GetterString.isRequired, // definition's `name` string for currently active Language
  en: type.String, // `name` string in English
  // 'ru': other definition's `name` strings by their language code
})

// set of localised definitions (example: LANGUAGE object)
type.DefinitionSet = type.ObjectOf(type.Definition.isRequired)

type.FileInput = type.Of({
  src: type.UrlOrBase64, // file source URL or base64 encoded string
  kind: type.Any, // type of file (ex: public/private...)
  i: type.Any, // identifier or index position of the file in the grid (ex. thumb/small/large...)
  id: type.String, // optional ID
  name: type.String, // file name with extension
  file: type.File, // -> sent by onChange callbacks for upload to backend (example: Dropzone file object)
  remove: type.Boolean, // -> sent by onChange callbacks for deletion to backend
  sizes: type.ListOf(type.Of({ // for ImageInput
    key: type.String, // resKey (ex. 'thumb', 'medium', '')
    val: type.Number, // size in bytes
  })),
})

// FIELD.FOR.TAG for example
type.FieldForList = type.ListOf(type.Of({
  id: type.String.isRequired,
}))
// One of @withForm() value getters
type.FormValueType = type.Enum(['changedValues', 'registeredValues', 'formValues'])

// Dropdown option
type.Option = type.OneOf(
  type.String,
  type.Number,
  type.Of({
    value: type.Any.isRequired,
    text: type.String.isRequired,
    content: type.Any,
  }),
)
type.Options = type.ListOf(type.Option.isRequired)
