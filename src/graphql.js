import { useMutation, useQuery } from '@apollo/react-hooks'
import React from 'react'
import { isFunction } from 'utils-pack'
import LoadingView from './Loading'

/**
 * GRAPHQL FUNCTIONS ===========================================================
 * =============================================================================
 */

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
 * @param {Object|Object<query, {variables, props, ...options}>} query - Graphql Query DocumentNode (with options)
 * @param {Object|Object<mutation, {variables, props, ...options}>} mutation - Graphql Mutation DocumentNode (with options)
 * @param {Object} [Loading] - Loading React component to render while waiting fetch
 * @returns {Function} decorator - HOC wrapper function for given React component
 */
export function withGql ({query = null, mutation = null, Loading = <LoadingView loading/>}) {
  return function Decorator (WrappedComponent) {
    let props = {} // persist props as closure object in between component life cycles
    return function GqlHOC (initialProps) {
      props = {...props, ...initialProps}
      let loading
      let error

      if (query) {
        let args = [query]
        if (query.query) {
          const {query: q, ...options} = query
          if (isFunction(options.variables)) options.variables = options.variables(props)
          args = [q, options]
        }
        const {loading: l, error: e, data, called: queried, ...more} = useQuery(...args)
        loading = l
        error = e
        props = {
          ...props,
          ...((query.props && data) ? query.props({props, data, queried, ...more}) : {...data, queried, ...more})
        }
      }

      if (mutation) {
        let args = [mutation]
        if (mutation.mutation) {
          const {mutation: m, ...options} = mutation
          if (isFunction(options.variables)) options.variables = options.variables(props)
          args = [m, options]
        }
        const [mutate, {loading, error, data, called: mutated, ...more}] = useMutation(...args)
        props = {...props, mutate, loading, error}
        props = {
          ...props,
          ...((mutation.props && data && !loading && !error && mutated)
            ? mutation.props({props, data, mutated, ...more})
            : {...data, mutated, ...more})
        }
      }

      if (loading) return Loading
      if (error) return null

      return <WrappedComponent {...props} />
    }
  }
}
