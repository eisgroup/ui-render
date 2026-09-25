export const downloadFile = (fileName) => (response) => {
  // create file link in browser's memory
  const href = URL.createObjectURL(response);

  // create "a" HTML element with href to file & click
  const link = document.createElement('a');
  link.href = href;
  // With no name the attribute is set EMPTY, so the browser picks one. Leaving it out instead would
  // make the click open the blob in the tab rather than download it; and before this was fixed,
  // `setAttribute('download', undefined)` saved the file under the string "undefined".
  link.setAttribute('download', fileName == null ? '' : fileName);
  document.body.appendChild(link);
  link.click();

  // clean up "a" element & remove ObjectURL
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}