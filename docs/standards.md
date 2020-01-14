# Coding Standards

## CSS Standard

Please refer to `repos/web/style/_variables.less` for reference.

## Javascript Standard

We use [Standard JS](https://standardjs.com/), the most popular linting standard for Javascript modern development (according to github at the moment of writing).
Please make sure to setup your Webstorm IDE correctly according to instructions given on `README.md`.

We write with the latest ES6, ES7 and some ES8 features, like class decorators, to keep the code minimal, elegant, and readable for the best Developer User Experience (DUX).

## Coding Best Practices

### Documentation

All functions, classes or complex flows must have block comments with clear documentation on all arguments and return types so that we can auto-generate docs in the future if needed.
Also include an example of usage if the function is not easy to understand, and to make it easier to use in the future.

Example:

```javascript
/**
 * Round Number to given Precision decimal point
 *
 * @example:
 *    roundNumber(123.4567, 3)
 *    >>> 123.457
 *
 * @param {Number} number - value to round
 * @param {Number} [precision] - decimal places to keep
 * @returns {Number} - with rounded values
 */
export function round (number, precision = 0) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}
```

### Naming Convention

#### I. Generic to Specific Naming

When naming variables, constants, or functions, stick to the 'reverse' naming approach - start with the generic meaning word, followed by the more specific meaning words.
Example: `ROUTES_FOR_ADMIN`, instead of `ADMIN_ROUTES`; `ROUTES_WHEN_LOGGED_IN`, instead of `LOGGED_IN_ROUTES`.

Why? Because this naming approach allows us to easily:

* organise things alphabetically
* see all available definitions while typing in IDE, without having to memorise possible options (i.e. by typing in `ROUTES_` we can see all IDE suggestions for it, without having to guess if there is an `ADMIN_...` definition among dozens of other 'admin' related definitions)
* help new developers discover existing definitions to avoid creating duplicates.

#### II. Parameters Naming

Use the widely accepted naming convention used in React for different data types:

* Booleans: start with `is...`, `has...`, `should...`, `was...`, `will...`, etc. (ex. `isList`, `hasValue`, `shouldUpdate`...)
* `items` - as standard parameter for list of values (arrays)
* `by` suffix for nested objects. Example: `function orderBy(key) {...}`

#### III. Naming for Readability

When naming functions/variables/constants, think about how they will read within the context of use. 

For example, a comparison function `by` that can be found inside `src/common/utils/array.js`, in and by itself is quite a vague name, however, it all makes sense within the context when used:

```javascript
// Notice how this reads like normal English
array.sort(by('firstName', 'lastName'))

// Instead of this more explicit, but verbose version that breaks our flow of thought
array.sort(sortByKeys('firstName', 'lastName'))
```

and since we have block comments for all functions, it shouldn't be a problem to call it `by`.

### Testing

All complex computation logic must have test coverage. Checkout `__tests__` folders for the kind of test you should write and how they are structured and named.

### Declare/Destruct All Variables at the Top

Example: within React render() method, declare all props and states at the top whenever possible, because this makes it a lot easier to identify/update all variables being used in the component:

```javascript
  render() {
    const { items, actions, className, style } = this.props
    const { isMobile } = this.state
    return (
      <View onClick={actions.doSomething} className={className} style={style}>
        <ScrollView reverse={isMobile}>
          ...
        </ScrollView>
      </View>    
    )
  }
```

### React Props Ordering

When passing props to React components, follow this approach:

```javascript
/* Multiple props that can't fit in one line */
<Button 
  disabled // true booleans are passed in first
  loading={false} // false booleans after
  onClick={actions.doSomething} // functions next
  // ...
  className='transparent' // class names should be strings without curly braces if possible
  style={{width: 120}} // custom styles last
 >
  Submit
 </Button> // close component on separate line if the entire component is not an one-liner
 
 /* One-liner declaration when possible */
 <Button onClick={actions.doSomething} className='transparent'>Submit</Button>
```
