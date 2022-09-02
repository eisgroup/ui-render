import { interpolateString, l, localiseTranslation } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'

/**
 * Download a single file from url (works for cross origin urls) in the browser
 * @param {String} url - of file to download
 * @param {String} [fileName] - optional file name to save as
 * @returns {Promise<void|Error>} promise - void if successful, else error object
 */
export function downloadFile (url, fileName) {
  return fetch(url).then(r => {
    if (r.ok) return r.blob()
    throw new Error(`${r.status} - ${r.statusText}.\n${interpolateString(_.REQUEST_FAILED_FOR_url, {url})}`)
  }).then(blob => {
    if (!fileName) fileName = url.split('/').pop().split('?')[0]
    if (navigator && navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName)
      return
    }
    url = URL.createObjectURL(blob)
    let a = document.createElement('a')
    document.body.appendChild(a)
    a.style.display = 'none'
    a.href = url
    a.download = fileName
    a.addEventListener('click', function () {
      if (a.parentElement) a.parentElement.removeChild(a)
      a = null
    })
    a.click()
    URL.revokeObjectURL(url)
  })
}

localiseTranslation({
  DOWNLOAD_FAILED_: {
    [l.ENGLISH]: 'Download Failed!',
  },
  REQUEST_FAILED_FOR_url: {
    [l.ENGLISH]: 'Request failed for {url}',
  },
})
