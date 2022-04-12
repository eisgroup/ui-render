export default {
  view: 'Row',
  items: [
    {
      view: 'Input',
      name: 'coverages.0.checkbox',
      styles: 'margin',
      label: 'Label (used if `labelTrue` or `labelFalse` undefined)',
      labelTrue: 'True Label',
      labelFalse: 'False Label',
      type: 'toggle',
      defaultValue: true
    },
    {
      view: 'Row',
      styles: 'middle',
      items: [
        {
          view: 'Input',
          name: 'ShowExperienceRating',
          id: 'toggleShowExperienceRating',
          styles: 'margin-right-smaller',
          type: 'toggle',
          label: ' ',
        },
        {
          view: 'Label',
          htmlFor: 'toggleShowExperienceRating',
          styles: 'bold pointer',
          children: 'Experience Rating'
        }
      ]
    },
  ]
}
