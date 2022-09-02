import { gqlRequestDecorator, updateCacheList } from 'ui-modules-pack/graphql'
import { LOGOUT } from 'ui-utils-pack'
import { USER, USERS } from './constants'
import { user as mutation } from './mutations'
import { logout, user as query, usersSummary } from './queries'

/**
 * API REQUESTS ================================================================
 * GraphQL queries and mutations, or REST API request Decorators
 * =============================================================================
 */

/**
 * Use Logout Query GraphQL Decorator
 */
export const withUserLogout = gqlRequestDecorator({
  field: LOGOUT,
  query: logout,
  skip: false,
})

/**
 * Last Updated Users Query GraphQL Decorator
 */
export const withUsersSummary = gqlRequestDecorator({
  field: USERS,
  query: usersSummary,
  skip: false,
})

/**
 * Query User without caching and checking for error (using route or prop Id) GraphQL Decorator
 */
export const withUserFetch = gqlRequestDecorator({
  field: USER,
  query,
  fetchPolicy: 'network-only',
  errorPolicy: 'ignore',
})

/**
 * Query and Mutation (using route or prop Id) GraphQL Decorator
 */
export const withUserEditRoute = gqlRequestDecorator({
  field: USER,
  query,
  mutation,
  update: updateCacheList(withUsersSummary, USER),
})
