/**
 * Request Data and Meta json for OpenL Widget
 *
 * @param {Object|Null|Undefined} [dataJson] - to update
 * @param {Object|Null|Undefined} [metaJson] - to update
 * @returns {Promise<{data: Object, meta: Object}>}
 */
window.POST = function (dataJson, metaJson) {
  return new Promise(function (resolve, reject) {
    window.POST.resolve = resolve
    window.POST.reject = reject

    // return onComplete('{"readonly": true}', '{"view": "Button", "type": "submit", "children": "save"}') // example
    if (dataJson == null) { // checks for undefined or null values
      // initial load, no data provided
      return onComplete(window.dataJson, window.metaJson)
    } else {
      // call to server to update dataJson (as object)
      // ...
    }
  })
}

function onComplete (dataJson, metaJson) {
  if (!window.POST.resolve) return
  window.POST.resolve({data: dataJson, meta: metaJson})
}
