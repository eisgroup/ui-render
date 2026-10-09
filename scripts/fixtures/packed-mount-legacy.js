// How the packed browser page mounts a document on React 16 and 17, which have no `react-dom/client`: the legacy
// root, which is what every 0.34.x host uses. scripts/test-packed-browser.js copies this or ./packed-mount-root.js
// into the throwaway host as `packed-mount.js`, by the host React's major.
const ReactDOM = require('react-dom')

module.exports = (element, node) => ReactDOM.render(element, node)
