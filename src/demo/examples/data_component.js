import { cloneDeep } from 'ui-utils-pack'
import exampleData from './example_data.json'

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
        // This component must have undefined `name` so that it automatically grabs all data for given `kind`
        view: 'Data',
        kind: 'period',
        initialValues: {},
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
    {
      view: 'Button',
      className: 'primary',
      onClick: 'submit',
      children: 'Submit (open Chrome Console to check changed values)'
    }
  ]
}

export const data = {
  ...exampleData,
  dataKind: {
    period: [
      {startDate: '2022-01-01', endDate: '2022-03-31'},
      {startDate: '2022-04-01', endDate: '2022-06-30'},
    ]
  }
}
