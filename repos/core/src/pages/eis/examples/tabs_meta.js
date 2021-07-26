export const meta = {
  view: 'Tabs',
  styles: 'padding',
  items: [
    {
      tab: {
        name: 'coverages.0.coverageID',
      },
      content: {
        view: 'Text',
        label: {
          name: 'coverages.0.fundingStructure.contributionType',
        }
      }
    },
    {
      tab: {
        name: 'coverages.1.coverageID',
      },
      content: {
        view: 'Text',
        label: {
          name: 'coverages.1.fundingStructure.contributionType',
        }
      }
    },
  ],
}

export const buttoned = {
  ...meta,
  buttoned: true
}
