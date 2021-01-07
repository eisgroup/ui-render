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
type.Float = PropTypes.number
type.Fraction = PropTypes.number // between 0 - 1
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
