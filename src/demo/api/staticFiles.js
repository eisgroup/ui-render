/**
 * The demo's `downloadFile` for the examples that do not talk to the rating service: fetch the URL
 * the meta names, as it is. "Button for Download File URL" downloads one of the demo's own static
 * images this way and saves it under the name its meta gives as the second argument.
 *
 * Until this existed those examples were mounted with no `apiCalls` at all, so that button did
 * nothing; and flagging the example `hostApi` would not have helped, because the rating service's
 * `downloadHistoricalFileTemplate` treats its argument as a file name on that service.
 *
 * A response that is not 2xx is REJECTED: `fetch` resolves on a 404, and the engine would otherwise
 * save the error page under the requested name — measured in the running demo — instead of showing
 * "Download Failed".
 */
export const downloadFromUrl = url => fetch(url).then(response => (response.ok ? response : Promise.reject(response)))
