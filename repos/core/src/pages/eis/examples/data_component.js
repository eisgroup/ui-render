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
const verify = {
  dataKind: 'period',
  validate: [
    {
      name: 'notWithinRange',
      args: ['startDate', 'endDate'],
    }
  ],
}
const inputStartDate = {
  view: 'Input',
  name: 'startDate',
  type: 'date',
  validate: 'required',
  verify: cloneDeep(verify),
  onChange: 'warn',
}
const inputEndDate = {
  view: 'Input',
  name: 'endDate',
  type: 'date',
  validate: 'required',
  verify: cloneDeep(verify),
}

const inputs = [inputStartDate, inputEndDate]
export const meta = {
  view: 'Col',
  styles: 'padding left bg-info-light',
  items: [
    {
      view: 'Table',
      name: 'dataKind.period',
      styles: 'outline margin-v',
      // showIf: {},
      extraHeaders: [
        [
          {
            colSpan: 999,
            label: 'Data Components',
            classNameHeader: 'bg-success-light',
            className: 'h5 align-center',
          },
        ]
      ],
      headers: [
        {
          id: 'startDate',
          label: 'Start Date',
          classNameHeader: 'padding-left-small border-right',
        },
        {
          id: 'endDate',
          label: 'End Date',
          classNameHeader: 'padding-left-small border-right',
        },
        {
          id: 'null',
          label: 'Action',
          className: 'align-center',
        },
      ],
      renderItemCells: {
        view: 'Data',
        kind: 'period',
        embedded: true,
        meta: {
          view: 'TableCells',
          styles: 'border-right no-border-right-last-item',
          style: {verticalAlign: 'top'},
          items: [
            {
              ...cloneDeep(inputStartDate),
              className: 'border-on-hover',
            },
            {
              ...cloneDeep(inputEndDate),
              className: 'border-on-hover',
            },
            {
              view: 'Col',
              items: [
                {
                  view: 'Button',
                  styles: 'a transparent',
                  children: 'Remove',
                  onClick: 'removeData',
                },
              ]
            },
          ],
        },
      },
      renderExtraItem: {
        view: 'Data',
        kind: 'period',
        name: 'dataComponent',
        embedded: true,
        meta: {
          view: 'TableCells',
          // styles: 'border-top',
          style: {verticalAlign: 'top'},
          items: [
            {
              float: true,
              label: 'Start Date',
              ...cloneDeep(inputStartDate),
            },
            {
              float: true,
              label: 'End Date',
              ...cloneDeep(inputEndDate),
            },
            {
              view: 'Col',
              items: [
                {
                  view: 'Button',
                  styles: 'a transparent margin-v-small',
                  children: 'Add',
                  onClick: 'addData',
                },
              ]
            },
          ],
        },
      },
    },
    // {
    //   view: 'Data',
    //   kind: 'period',
    //   name: 'dataComponent',
    //   styles: 'max-width-400',
    //   meta: {
    //     view: 'Col',
    //     styles: 'app__form left padding margin bg-success-light',
    //     items: [
    //       {
    //         view: 'Text',
    //         styles: 'h3 padding-top',
    //         label: 'Data Component (UI Render)',
    //       },
    //       {
    //         view: 'Row',
    //         items: [
    //           {
    //             label: 'Start Date',
    //             ...cloneDeep(inputStartDate)
    //           },
    //           {
    //             label: 'End Date',
    //             ...cloneDeep(inputEndDate)
    //           },
    //         ],
    //       },
    //       {
    //         view: 'Button',
    //         styles: 'margin-v',
    //         children: 'Add',
    //         type: 'submit',
    //         onClick: 'addData',
    //       },
    //       // cloneDeep(dropdownPlan),
    //     ]
    //   },
    //   // rootData: true,
    // },
    // cloneDeep(dropdownPlan),
  ]
}

export const data = {
  // dataComponent: {
  //   startDate: Date.now(),
  //   ...exampleData,
  // },
  ...exampleData,
  dataKind: {
    period: [
      {startDate: '2022-01-01', endDate: '2022-03-31'},
      {startDate: '2022-04-01', endDate: '2022-06-30'},
    ]
  }
}
