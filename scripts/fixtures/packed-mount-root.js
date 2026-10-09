// How the packed browser page mounts a document on React 18 and 19, the root API. scripts/test-packed-browser.js
// copies this or ./packed-mount-legacy.js into the throwaway host as `packed-mount.js`, by the host React's major.
const { createRoot } = require('react-dom/client')

module.exports = (element, node) => createRoot(node).render(element)
