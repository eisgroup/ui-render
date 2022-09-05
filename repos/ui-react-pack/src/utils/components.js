import { isObject } from 'ui-utils-pack'

/**
 * Semantic UI Popup props for nested Dropdown Menu (usually Buttons)
 */
export const dropdownPopup = {
  // style: {position: 'absolute', top: -36, left: -18}, // uncomment for overlapping the first button
  className: 'no-margin no-padding no-box-shadow no-border', // add `overlap [first/last]` class for styling
  basic: true, // remove pointer
  position: 'bottom center',
  inverted: false,
  hoverable: true, // comment this for debugging (sticky for dev console)
  on: ['hover', 'focus'],
  // on: 'click', // uncomment this for debugging (sticky for dev console)
}

/**
 * Convert `tooltip` prop to Popup props for rendering
 *
 * @param {Object|String|Number} tooltip - prop
 * @param {Object|Boolean} [defaultProps] - to use for Tooltip
 * @returns {Object} props - ready for use with Semantic UI Popup or Tooltip component
 */
export function tooltipProps (tooltip, defaultProps) {
  return {...defaultProps, ...isObject(tooltip) ? tooltip : {title: tooltip}}
}
