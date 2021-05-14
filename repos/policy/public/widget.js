let widget
const targetNode = document.body
// Options for the observer (which mutations to observe)
const config = {childList: true, subtree: true}
// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
  // Use traditional 'for loops' for IE 11
  let mutated = false
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      mutated = true
      break
    }
  }
  if (mutated) {
    const node = document.getElementById('ui-render')
    if (node && widget !== node) {
      widget = node
      console.log('Widget added!!!', widget)
      loadUiRender()
    }
  }
}

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback)

// Start observing the target node for configured mutations
observer.observe(targetNode, config)

///--------------
function createScript (src, callback) {
  if (typeof document === 'undefined') return
  const d = document, t = 'script',
    o = d.createElement(t),
    s = d.getElementsByTagName(t)[0]
  o.src = src
  o.async = false
  if (callback) { o.addEventListener('load', callback, false) }
  s.parentNode.insertBefore(o, s)
}

function loadUiRender (baseUrl = 'http://mnsopenl.exigengroup.com/react') {
  createScript(
    baseUrl + '/loader.js',
    // createScript(
    // baseUrl + '/static/js/1.31615747.chunk.js',
    createScript(baseUrl + '/static/js/main.e861df04.chunk.js')
    // )
  )
}
