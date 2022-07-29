### Table of Contents

## Overview

All available CSS styles can be found in the repository, under the [style](https://github.com/eisgroup/ui-render/tree/master/repos/web/style) folder.

Below you can find the list of commonly used CSS styles.

## Alignment
- **align-center** - horizontally and vertically align child items to the center and middle, including all nested text
- **justify** - horizontally distribute child items evenly, taking the full width  
- **stretch** - vertically distribute child items evenly, taking the full height  
- **spread** - horizontally/vertically distribute child items evenly, with equal spaces around
- **center** - horizontally align child items to the center 
- **left** - align child items to the left
- **right** - align child items to the right
- **middle** - vertically align child items to the middle
- **bottom** - align child items to the bottom
- **top** - align child items to the top

## Distribution
- **reverse** - revert the rending order of child items from the order they are defined in the component (RTL support)
- **rtl** - RTL (Right to Left) text direction (for languages, such as Japanese)
- **wrap** - required for horizontal layout to be responsive (arranges child items to new lines on narrow/mobile screens)

## Effects
- **inverted** - inverts text/border color
- **primary** - 
- **secondary** -
- **error** -  
- **info** - 
- **success** - 
- **warning** - 
- **grey** - 
- 
- **bg-grey** - grey background color
- **bg-grey-light/lighter/lightest** - grey background color with adjusted tone (i.e. "bg-grey-lightest" = lightest)
- **bg-black** - black background color
- **bg-white** - white background color
- **bg-error** - background using the theme's error color (red at the moment of writing)
- **bg-info** - background using the theme's info color (teal at the moment of writing)
- **bg-success** - background using the theme's success color (green at the moment of writing)
- **bg-warning** - background using the theme's warning color (orange at the moment of writing)
- **bg-error-light** - background using the theme's error light color (light red at the moment of writing)
- **bg-info-light** - background using the theme's info light color (light teal at the moment of writing)
- **bg-success-light** - background using the theme's success light color (light green at the moment of writing)
- **bg-warning-light** - background using the theme's warning light color (light orange at the moment of writing)
- **bg-primary** - background using the theme's primary color (blue at the moment of writing)
- **bg-primary-light/lighter/lightest** - primary background with adjusted tone (i.e. "bg-primary-lightest" = lightest)
- **bold** - use thick font to bolden text
- **border** - add standard lines around the component boundaries
- **border-h** - add border to the left and right
- **border-v** - add border to the top and bottom
- **border-left/right/top/bottom** - add border to the specified direction (i.e. "border-right" = lines to the right)
- **border-on-hover** - for inline Inputs to look like text when not active
- **box-shadow** - add drop shadow
- **circle** - turn the component into a circular shape
- **radius** - rounded corners
- **radius-small/large/larger/largest** - rounded corners with adjusted amount (i.e. "radius-largest" = the most rounded)
- **text-highlight** - add text highlight
- **text-shadow** - add text shadow
- **uppercase** - make all text UPPERCASE

## Spacing
- **padding** - add standard space between child items and the parent container boundaries
- **padding-large/larger/largest/small/smaller/smallest** - add padding with adjusted amount (i.e. "padding-largest" = the biggest padding)
- **padding-left/right/top/bottom** - add padding to the specified direction (i.e. "padding-right" adds space to the right)
- **padding-left/right/top/bottom-large/larger/largest/small/smaller/smallest** - see above
- **padding-h** - add padding to the left and right
- **padding-v** - add padding to the top and bottom
- **padding-h-large/larger/largest/small/smaller/smallest** - add padding to the left and right with adjusted amount
- **padding-v-large/larger/largest/small/smaller/smallest** - add padding to the top and bottom with adjusted amount
- **no-padding** - remove padding
- **no-padding-left/right/top/bottom/h/v** - remove padding in the specified direction
- **margin** - add standard space around the component boundaries
- **margin-large/larger/largest/small/smaller/smallest** - add margin with adjusted amount (i.e. "margin-largest" = the biggest margin)
- **margin-left/right/top/bottom** - add margin to the specified direction (i.e. "margin-right" adds space to the right)
- **margin-left/right/top/bottom-large/larger/largest/small/smaller/smallest** - see above
- **margin-h** - add margin to the left and right
- **margin-v** - add margin to the top and bottom
- **margin-h-large/larger/largest/small/smaller/smallest** - add margin to the left and right with adjusted amount
- **margin-v-large/larger/largest/small/smaller/smallest** - add margin to the top and bottom with adjusted amount
- **no-margin** - remove margin
- **no-margin-left/right/top/bottom/h/v** - remove margin in the specified direction

## Sizes
- **fill-width** - component takes all available width (i.e. <= 100%)
- **fill-height** - component takes all available height (i.e. <= 100%)
- **full-width** - component takes 100% width
- **full-height** - component takes 100% height
- **full-screen** - component takes minimum 100% width and 100% height
- **min-width-290** - component takes minimum 290px width (to support the smallest mobile screens of 320px)
- **min-height-290** - component takes minimum 290px height (to support the smallest mobile screens of 320px)
- **min-size-290** - component takes minimum 290px width and height (to support the smallest mobile screens of 320px)
- **min-width** - component takes minimum width required to render all of its child items
- **min-height** - component takes minimum height required to render all of its child items
- **max-width** - component takes maximum 100% width (to stay within the boundaries of the parent container)
- **max-height** - component takes maximum 100% height (to stay within the boundaries of the parent container)
- **max-size** - component takes maximum 100% width and height (to stay within the boundaries of the parent container)
