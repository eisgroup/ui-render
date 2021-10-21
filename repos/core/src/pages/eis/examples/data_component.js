import { cloneDeep } from 'utils-pack'
import dropdownMeta from './dropdown_meta.json'
import exampleData from './example_data.json'

const dropdownPlan = {
  view: 'Row',
  styles: 'middle margin-v',
  items: [
    {...dropdownMeta, compact: true, style: {}},
    {
      view: 'Text',
      styles: 'padding no-padding-right bold',
      label: 'Plan:',
    },
    {
      view: 'Text',
      styles: 'padding',
      label: {
        name: 'coverages.{state.coverage,0}.coverageID'
      }
    },
  ]
}

export const metaJson = {
  view: 'Col',
  styles: 'app__form left padding margin bg-success-light',
  items: [
    {
      view: 'Text',
      styles: 'h3 padding-top',
      label: 'Data Component (UI Render)',
    },
    cloneDeep(dropdownPlan),
    {
      view: 'Row',
      items: [
        {
          view: 'Input',
          name: 'startDate',
          label: 'Start Date',
          validate: 'required',
          verify: {
            dataKind: 'period',
            validate: {
              name: 'notWithinRange',
              args: ['startDate', 'endDate'],
            },
          }
        },
        {
          view: 'Input',
          name: 'endDate',
          label: 'End Date',
          validate: 'required',
          verify: {
            dataKind: 'period',
            validate: {
              name: 'notWithinRange',
              args: ['startDate', 'endDate'],
            },
          }
        },
      ]
    },
    {
      view: 'Button',
      styles: 'margin-v',
      children: 'Add',
      type: 'submit',
      onClick: 'addData',
    },
  ]
}

export const meta = {
  view: 'Col',
  styles: 'padding left bg-info-light',
  items: [
    {
      view: 'Text',
      styles: 'h1',
      label: 'Global (UI Render)'
    },
    cloneDeep(dropdownPlan),
    {
      view: 'Table',
      name: 'dataKind.period',
      styles: 'margin-v',
      showIf: {},
      headers: [
        {
          id: 'startDate',
          label: 'Start Date',
          classNameHeader: 'border-right',
          classNameCell: 'border-right',
        },
        {
          id: 'endDate',
          label: 'End Date',
        },
      ],
      extraHeaders: [
        [
          {
            colSpan: 2,
            label: 'Table using Data Components',
            classNameHeader: 'bg-warning-light',
          },
        ]
      ],
    },
    {
      view: 'Data',
      kind: 'period',
      name: 'dataComponent',
      styles: 'max-width-400',
      meta: metaJson,
      // rootData: true,
    }
  ]
}

export const data = {
  dataComponent: {
    startDate: Date.now(),
    ...exampleData,
  },
  ...exampleData,
}
