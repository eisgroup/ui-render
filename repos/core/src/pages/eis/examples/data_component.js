import { cloneDeep } from 'utils-pack'
import dropdownMeta from './dropdown_meta.json'
import exampleData from './example_data.json'

const dropdownPlan = {
  view: 'Row',
  styles: 'middle',
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

export const dataMeta = {
  view: 'Col',
  styles: 'app__form left padding',
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
        },
        {
          view: 'Input',
          name: 'endDate',
          label: 'End Date',
          validate: 'required',
          verify: {
            kind: 'period',
            validate: {
              name: 'noOverlap',
              start: 'startDate',
              end: 'endDate',
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
  styles: 'padding left',
  items: [
    {
      view: 'Text',
      styles: 'h1',
      label: 'Global (UI Render)'
    },
    cloneDeep(dropdownPlan),
    {
      view: 'Data',
      kind: 'period',
      name: 'dataComponent',
      meta: dataMeta,
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
