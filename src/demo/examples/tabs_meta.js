export const meta = {
  view: 'Tabs',
  styles: 'padding',
  items: [
    {
      tab: {
        name: 'categories.0.categoryID',
      },
      content: {
        view: 'Text',
        label: {
          name: 'categories.0.configuration.inputType',
        }
      }
    },
    {
      tab: {
        name: 'categories.1.categoryID',
      },
      content: {
        view: 'Text',
        label: {
          name: 'categories.1.configuration.inputType',
        }
      }
    },
  ],
}

export const buttoned = {
  ...meta,
  buttoned: true
}
