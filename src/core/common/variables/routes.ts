export function goTo (uri: string, title: string = uri, page: string = uri) {
  if (typeof window === 'undefined') return
// eslint-disable-next-line no-restricted-globals
  if (typeof history === 'undefined') return
// eslint-disable-next-line no-restricted-globals
  if (typeof history.pushState !== 'undefined') {
// eslint-disable-next-line no-restricted-globals
    history.pushState({page: page}, title, uri)
  } else {
    window.location.assign(uri)
  }
}
