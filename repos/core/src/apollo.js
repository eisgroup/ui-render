import { ApolloProvider } from '@apollo/react-hooks'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { createUploadLink } from 'apollo-upload-client'
import { API_GQL_URL } from 'modules-pack'
import { HTTP_401_UNAUTHORIZED } from 'modules-pack/api'
import { NAME as POPUP } from 'modules-pack/popup'
import { stateAction } from 'modules-pack/redux/actions'
import { _, Active, ERROR, get, LOGIN, toList, warn } from 'utils-pack'

/**
 * APOLLO CLIENT SETUP =========================================================
 * =============================================================================
 */

const cache = new InMemoryCache()

// @NOTE: Chrome must be opened by `yarn cors` command, or cookies won't work in dev mode,
// because server is run on different port from client.
// Default setting for `credentials` should be 'same-origin' already, so no additional setup required
const client = new ApolloClient({
  link: ApolloLink.from([
    // @Note: onError does not provide `errorPolicy` so we cannot suppress error conditionally
    onError(({graphQLErrors, networkError}) => {
      if (get(graphQLErrors, '[0].statusCode') === HTTP_401_UNAUTHORIZED) {
        warn(`GraphQL Response ${HTTP_401_UNAUTHORIZED}!!!`)
        Active.store.dispatch(stateAction(LOGIN))
      } else {
        warn('GraphQL Request failed!!!', graphQLErrors, networkError)
        Active.store.dispatch(stateAction(POPUP, ERROR, {
          title: graphQLErrors ? _.REQUEST_FAILED : _.SERVER_DISCONNECTED,
          errors: toList(graphQLErrors || networkError)
        }))
      }
    }),
    createUploadLink({
      uri: API_GQL_URL,
      credentials: 'same-origin',
    }),
  ]),
  cache,
})

export default {
  Provider: ApolloProvider,
  client,
}

Active.client = client
