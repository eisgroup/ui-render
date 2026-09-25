const buttonDownloadMeta = {
  view: 'Button',
  items: [
    {
      view: 'Icon',
      name: 'file-download',
      styles: 'margin-right-smaller'
    },
    {
      view: 'Text',
      children: 'Download File Template'
    },
  ],
  onClick: {
    name: 'download',
    args: [
      // Relative to the page, so it resolves under the demo's base both in the dev server
      // (`/examples` → `/static/…`) and on GitHub Pages (`/ui-render/examples` → `/ui-render/static/…`).
      // It used to choose the prefix by `__DEV__`, which is false in the demo's browser bundle, so
      // the dev server asked for `/ui-render/static/…` and got a 404.
      'static/images/ui-architecture.png',
      'optional-file-name-to-save-as.png'
    ]
  }
}

export default buttonDownloadMeta