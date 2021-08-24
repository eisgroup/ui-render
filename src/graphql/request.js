import { useMutation, useQuery } from '@apollo/client'
import { idFromRoute, uriFrom } from 'modules-pack/router/utils'
import { ROUTES } from 'modules-pack/variables'
import React from 'react'
import { getOriginalClass } from 'react-ui-pack'
import LoadingView from 'react-ui-pack/Loading'
import {
  Active,
  get,
  isEmpty,
  isEqual,
  isFunction,
  isList,
  sanitizeResponse,
  set,
  toList,
  toLowerCase
} from 'utils-pack'
import { GQL_HIDDEN_FIELDS } from './constants'

/**
 * GRAPHQL REQUEST HELPERS =====================================================
 * @Architecture
 *  - see https://www.apollographql.com/blog/apollo-client/performance/batching-client-graphql-queries/
 *  - Batching Queries is better than merge, but has downsides:
 *    + Pros: single HTTP request
 *    + Pros: performance tracking
 *    - Cons: no whole-query cache TTLs
 *    - Cons: blocking UI with the slowest query
 *  - Optimistic chained queries:
 *    + Pros: performance tracking
 *    + Pros: separate cache policies
 *    + Pros: non-blocking progressive UI
 *    - Cons: multiple HTTP requests
 *  => Use chained queries with optional `optimistic` flag to fire multiple requests simultaneously.
 * =============================================================================
 */

/** `gqlRequestDecorator()` config flag to set defaults for requests without variables that always need querying */
export const reusable = true
/** whether to render the component immediately (good for non-blocking chained requests) */
export const optimistic = true
/**
 * `gqlRequestDecorator()` configs for using the request response as dropdown options
 * @example:
 *    gqlRequestDecorator({
 *      propsMapperOptions: {asProp: 'tagOptions', ...asDropdownOptions},
 *    })
 */
export const asDropdownOptions = {
  mapEntry: (list) => list.map(entry => ({text: entry.name, value: entry.id})),
  initialValues: false,
  fallback: [],
}

/**
 * Default GraphQL Query `variables` helper to get Entry ID for initial Query
 * @example:
 *  withGql({
 *    query: {
 *      variables,
 *    },
 *  })
 *
 * @param {Object} props - from React Component
 * @returns {{id: String}|{}} variables - for GraphQL request
 */
export function queryVariables (props) {
  const id = props.id || idFromRoute(props)
  return (id && id !== ROUTES.NEW) ? {id} : {}
}

/**
 * Default GraphQL Query `skip` helper to avoid querying when `variables` is empty
 * @example see queryVariables
 * @returns {Boolean} true if no ID exists
 */
export function querySkip (props, variables) {
  return isEmpty(variables)
}

/**
 * Decorator for React Components to Query or Mutate GraphQL API
 *
 * @example:
 *    // 1. Simple GraphQL decorated view
 *    @withGql({query})
 *    export default class UserProfile extends Component {
 *      mutate = () => {
 *        this.props.mutate({variables: {user}})
 *      ...
 *    }
 *
 *    // 2. Updating props after query called (for use with Redux Form)
 *    const props = ({props, props: {initialValues: init = {}}, data: {user}}) => ({
 *      // To prevent flickering effect when mutation sets loading = true, only change initialValues when needed
 *      initialValues: !isEqual(props.user, user) ? {...init, ...sanitizeGqlResponse(user || {}, {clone: true})} : init,
 *      user,
 *    })
 *    @withGql({query: {query, props}, mutation: {mutation, props}})
 *    @withForm({form: USER, enableReinitialize: true})
 *    export default class UserProfile extends Component {
 *      ...
 *    }
 *
 * @note:
 *  - Query results will be attached directly to Component props, without `data` prop
 *  - Mutation is attached to Component as props.mutate, for example: this.props.mutate({variables: {user}})
 *  - If passing {variables} options, `variables` can be a function that receives instance props as argument,
 *    and returns variables object to be used with query or mutation
 *
 * @param {Object|Object<query, variables, propsMapper, ...options>} query - Graphql Query DocumentNode (with options)
 * @param {Object|Object<mutation, variables, propsMapper, ...options>} mutation - Graphql Mutation DocumentNode (with options)
 * @param {Object} [Loading] - Loading React component to render while waiting fetch
 * @returns {Function.Class} Decorator - HOC wrapper for Class/Function Component, which returns wrapped Component
 *          => the original Class (if the Component wrapped was a Class) can be accessed via wrapped Component.Class
 */
export function withGql ({query = null, mutation = null, Loading = LoadingView}) {
  return function GqlDecorator (Component) {
    let ownProps = {} // persist props as closure object in between component life cycles
    let prevURI, uri
    let prevQueryLoading = false
    let prevMutationLoading = false
    let _mutate
    let QueryComponent, MutationComponent

    // Define mutate wrapper here to avoid causing props change
    function mutateWrapper (...args) {
      return _mutate.apply(this, [mutation.mutate.apply(this, args)])
    }

    function GqlQuery (initialProps) {
      // Allow chaining requests by overriding on own props only
      const props = {...initialProps, ...ownProps, data: {...initialProps.data, ...ownProps.data}}
      let errorPolicy
      let args = [query]

      /* Query Setup */
      if (query.query) {
        const {query: q, optimistic, ...options} = query
        ownProps.optimistic = optimistic
        if (isFunction(options.variables)) options.variables = options.variables(props)
        if (isFunction(options.skip)) options.skip = options.skip(props, options.variables)

        // Provide default Apollo.client so components can render as nested child (i.e. content: () => <Component/>)
        if (options.client === undefined) options.client = Active.client
        // Fix for chaining queries when used as the last query
        // @see: issue: https://github.com/apollographql/react-apollo/issues/3774
        if (options.pollInterval == null) options.pollInterval = 0
        if (!options.onCompleted) options.onCompleted = () => {}

        errorPolicy = options.errorPolicy
        args = [q, options]
      }

      const {loading, error, data, previousData, called: fetched, ...more} = useQuery(...args)
      // Let query override props only after a successful HTTP 200 response, cache update, or route changes.
      // This avoids overriding nested mutation data when higher up containers,
      // like App.js force re-rendering (ex. layout/language/currency change).
      // => Also not possible to call .propsMapper for `fallback` value
      if (
        // successful HTTP 200 response or re-render from `updateCacheList()`
        // (`previousData` must exist, else `data` is always different from `previousData`)
        (data && fetched && !error && !loading && (prevQueryLoading || (data !== previousData && previousData))) ||
        (prevURI && prevURI !== (uri = uriFrom(initialProps))) // route change
      ) {
        prevURI = uri
        ownProps = {
          ...ownProps,
          ...(query.propsMapper ? query.propsMapper({props, data, fetched, ...more}) : {...data, fetched, ...more})
        }
      }
      prevQueryLoading = loading
      const finalProps = {...props, ...ownProps}
      const isInit = !ownProps.data // `data` is undefined initially

      // If the query (or the entire component) is optimistic, render it immediately.
      // Else, only show loading during the first initialization, because the query may be polling in the background.
      // @Note: if `next/router` is used, sync it with react-router `location` state API
      if (loading && isInit && !ownProps.optimistic && !get(finalProps, 'location.state.optimistic')) return <Loading/>

      // Skip rendering on initial error response
      if (error && errorPolicy !== 'ignore' && isInit) return null

      return <QueryComponent {...finalProps}/>
    }

    function GqlMutation (initialProps) {
      // Allow chaining requests by overriding on own props only
      const props = {...initialProps, ...ownProps, data: {...initialProps.data, ...ownProps.data}}
      let args = [mutation]

      /* Mutation Setup */
      if (mutation.mutation) {
        const {mutation: m, ...options} = mutation
        // Provide default Apollo.client so components can render as nested child (i.e. content: () => <Component/>)
        if (options.client === undefined) options.client = Active.client
        if (isFunction(options.variables)) options.variables = options.variables(props)
        args = [m, options]
      }

      const [mutate, {loading, error, data, called: saved, ...more}] = useMutation(...args)
      ownProps = {...ownProps, mutate, loading, saved} // do not include `error` - it may clash with react-final-form

      // Apply form middleware
      if (mutation.mutate) {
        _mutate = mutate
        ownProps.mutate = mutateWrapper
      }

      // Since propsMapper gets called twice (for query first, then mutation)
      // it should only be called when new mutation response comes back.
      // Disabling query.propsMapper after mutation is not an option,
      // because refetch or polling may need to update props again.
      // => Let mutation override props only after a successful HTTP 200 response.
      if (prevMutationLoading && !loading && !error && saved && data) {
        ownProps = {
          ...ownProps,
          ...(mutation.propsMapper ? mutation.propsMapper({props, data, ...more}) : {...data, ...more})
        }
      }
      prevMutationLoading = loading

      return <MutationComponent {...props} {...ownProps} />
    }

    // Recursively attach the original wrapped Class component for access with chained request decorators
    const Class = getOriginalClass(Component)
    if (Class) {
      GqlQuery.Class = Class
      GqlMutation.Class = Class
    }

    // Query may not exist for custom queries, or when only Mutation is needed
    if (query && mutation) {
      QueryComponent = GqlMutation
      MutationComponent = Component
      return GqlQuery
    }

    if (query) {
      QueryComponent = Component
      return GqlQuery
    }

    if (mutation) {
      MutationComponent = Component
      return GqlMutation
    }

    return Component
  }
}

/**
 * Create Query and Mutation (using route Id) GraphQL Decorator
 *
 * @param {String} field - GraphQL entry field to be queried/mutated
 * @param {Object} query - imported query.gql file
 * @param {Object} mutation - imported mutation.gql file
 * @param {Boolean} [reusable] - whether to use default configs for requests without variables that always need querying
 * @param {Function<{props, data, fetched, saved, ...useQueryOrMutation}>} [propsMapper] - Component props mapper
 * @param {Object} [propsMapperOptions] - see `createPropsMapper` for reference
 * @param {String[]} [hiddenFields] - list of GraphQL Type fields to remove from response to sync with `form` state
 * @param {Function<props>|Object} [variables] - initial query variables mapper
 * @param {String} [fetchPolicy] - https://www.apollographql.com/docs/react/data/queries/#supported-fetch-policies
 * @param {String} [nextFetchPolicy] - see above
 * @param {String} [errorPolicy] - query policy to ignore errors
 * @param {Function<props>} [skip] - return true to skip initial fetching
 * @param {Boolean} [optimistic] - whether to render the component immediately (good for non-blocking chained requests)
 * @param {Function<options, instance>|Function[]} [mutate] - wrapper/s around Apollo mutate function, to use as form middleware
 * @param {Function|Function[]} [update] - cache after mutation https://www.apollographql.com/docs/react/data/mutations/#usemutation-api
 * @param {Object} [optimisticResponse] - see above link
 * @param {Array<string|{query, variables}>} [refetchQueries] - see above link
 * @param {*} [options] - more GQL query options to pass
 * @returns {Function<Component>|{asProp, field, query, variables}} Decorator - HOC wrapper for Class/Function Component
 */
export function gqlRequestDecorator ({
  field,
  query,
  mutation,
  // config shortcuts
  reusable,
  // Optional
  propsMapper,
  propsMapperOptions,
  hiddenFields,
  variables = reusable ? {} : queryVariables, // GraphQL treats any new empty object {} as the same variables
  // @see: https://github.com/apollographql/apollo-client/issues/6760
  // 'cache-and-network' literally forces query to refetch after mutation
  fetchPolicy = 'cache-and-network',
  // 'cache-first' for mutations with 'cache-and-network' fetchPolicy
  nextFetchPolicy = 'cache-first',
  errorPolicy,
  skip = reusable ? false : querySkip,
  optimistic = reusable,
  mutate,
  update,
  optimisticResponse,
  refetchQueries,
  ...options
}) {
  field = toLowerCase(field)

  // Combine updates
  if (isList(update)) {
    const updateList = update
    update = function (...args) { updateList.forEach(func => func.apply(this, args)) }
  }

  // Combine mutate form middleware
  if (isList(mutate)) {
    const mutateList = mutate
    mutate = function (...args) { return Object.assign({}, ...mutateList.map(func => func.apply(this, args))) }
  }

  // Default Props Mapper
  if (!propsMapper) {
    const config = {field, ...propsMapperOptions}
    const _hiddenFields = config.hiddenFields || hiddenFields
    config.hiddenFields = _hiddenFields && GQL_HIDDEN_FIELDS.concat(toList(_hiddenFields))
    propsMapper = createPropsMapper(config)
  }

  const closure = {variables: {}}
  const decorator = withGql({
    query: {
      query,
      propsMapper,
      // Attach variables to Query decorator for Cache readQuery/writeQuery
      variables: variables && ((...args) => (closure.variables = (isFunction(variables) ? variables(...args) : variables))),
      fetchPolicy,
      nextFetchPolicy,
      errorPolicy,
      skip,
      optimistic,
      ...options,
    },
    ...mutation && {
      mutation: {
        mutation,
        propsMapper,
        mutate,
        update,
        optimisticResponse,
        refetchQueries,
      }
    }
  })
  if (propsMapperOptions && propsMapperOptions.asProp) decorator.asProp = propsMapperOptions.asProp
  Object.defineProperty(decorator, 'variables', {get () {return closure.variables}})
  decorator.field = field
  decorator.query = query

  return decorator
}

/**
 * Create `propsMapper` function for use with `gqlRequestDecorator`
 * @param {String} field - GraphQL entry field from response to map to props
 * @param {String} [asProp] - name of the entry in the props object (defaults to entry `name`)
 * @param {Boolean} [initialValues] - whether to map sanitized data to `initialValues` for form state
 * @param {String[]} [hiddenFields] - list of GraphQL Type fields to remove from response to sync with `form` state
 * @param {Function} [mapEntry] - function to process entry in data response after sanitization
 * @param {Function} [mapData] - function to process the entire data response
 * @param {*} [fallback] - value to use when entry data is undefined
 * @returns {Function<props, data...>} propsMapper
 */
export function createPropsMapper ({
  field,
  asProp,
  initialValues = true,
  fallback = {},
  hiddenFields,
  mapEntry,
  mapData
}) {
  const _field = `_${asProp || field}`
  /**
   * @param {Object} props - global component props
   * @param {Object|Undefined} data - GraphQL server response
   * @param {Function} refetch - query options
   */
  return ({props, data = {}}) => {
    const {[field]: entry, ...gqlResponse} = data
    // When nothing changed, must return undefined to prevent overriding global props for chained requests
    if (props[_field] === entry || isEqual(props[_field], entry)) return

    // New props override
    let record = sanitizeResponse(entry || fallback, {clone: true, tags: hiddenFields})
    if (mapEntry) record = mapEntry(record, props)
    return ({
      ...initialValues && {initialValues: record},
      [asProp || field]: record,
      [_field]: entry,
      // pass around additional responses not in the main entry query
      data: {...props.data, ...(mapData ? mapData(data) : gqlResponse)},
    })
  }
}

/**
 * Create GraphQL propsMapper `mapEntry` function to convert nested Type objects to their IDs
 * @example:
 *    // setup
 *    gqlRequestDecorator({
 *      propsMapperOptions: {mapEntry: mapEntryFieldToId(TAGS)},
 *    })
 *
 *    // usage
 *    instance.tags = [{id: 'TagID', name: 'Tag Name'}]
 *    const mapEntry = mapEntryFieldToId('tags')
 *    mapEntry(instance)
 *    >>> instance.tags = ['TagID']
 *
 * @param {String|String[]} fields - path to nested Graphql Types within the entry
 * @returns {Function<entry>} mapEntry - function to use with `propsMapper()`
 */
export function mapEntryFieldToId (fields) {
  fields = toList(fields).map(toLowerCase)
  return function mapEntry (record) {
    fields.forEach(field => {
      let nestedEntry = get(record, field)
      if (!nestedEntry) return
      if (isList(nestedEntry)) {
        nestedEntry = nestedEntry.map(({id}) => id)
      } else if (nestedEntry.id) {
        nestedEntry = nestedEntry.id
      }
      set(record, field, nestedEntry)
    })
    return record
  }
}

/**
 * Create GraphQL Mutation `update` function to update the Entry List in Cache
 * @example:
 *    const withTagEditRoute = gqlRequestDecorator({
 *      ...
 *      update: updateCacheList(withTagOptions, TAG),
 *    })
 *
 * @param {Function<Component>|{field, query, variables}} queryDecorator - that needs update (created by gqlRequestDecorator)
 * @param {String|String[]} [mutatedPath] - path to new entry list in mutation result (ex. ['cat', 'tags']), defaults to `field`
 * @returns {Function<cache, {data}>} update - https://www.apollographql.com/docs/react/data/mutations/#usemutation-api
 */
export function updateCacheList (queryDecorator, mutatedPath) {
  const {field, query} = queryDecorator
  // Since most entry types should be a single word, it's common to assume the path as lowercase
  const path = mutatedPath ? toList(mutatedPath).map(toLowerCase) : field
  return function updateCache (cache, {data}) {
    const updatedList = toList(get(data, path), 'clean')
    if (!updatedList.length) return
    const {variables} = queryDecorator // variables must be retrieved on the fly
    const {[field]: cacheList = []} = cache.readQuery({query, variables}) || {} // query may not exist yet
    // temporary turn the list into hash map object for fast update
    const result = {}
    let modified = false
    for (const entry of cacheList) {
      result[entry.id] = entry
    }
    for (const entry of updatedList) {
      if (isEqual(entry, result[entry.id])) continue
      modified = result[entry.id] = {...result[entry.id], ...entry} // merge updates by default, instead of replacing
    }
    if (modified) cache.writeQuery({
      query, variables,
      data: {[field]: Object.values(result)},
    })
  }
}
