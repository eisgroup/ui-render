const sliderMeta = {
  view: 'VerticalLayout',
  styles: 'padding-large',
  items: [
    {
      view: 'Title',
      label: 'Single value',
      styles: 'h4 margin-bottom-small',
    },
    {
      view: 'Text',
      children: 'Drag the handle or click the track. Keyboard: arrows step by `step`, Home/End jump to bounds.',
      styles: 'margin-bottom',
    },
    {
      view: 'Input',
      type: 'slider',
      name: 'volume',
      min: 0,
      max: 100,
      step: 1,
      tooltipProps: {},
      unit: '%',
    },

    {
      view: 'Title',
      label: 'Range (two handles)',
      styles: 'h4 margin-top-large margin-bottom-small',
    },
    {
      view: 'Text',
      children: 'Bind value to an array `[from, to]` to enable range mode. Handles can swap by dragging past each other.',
      styles: 'margin-bottom',
    },
    {
      view: 'Input',
      type: 'slider',
      name: 'priceRange',
      min: 0,
      max: 1000,
      step: 10,
      tooltipProps: {},
      unit: '$',
    },

    {
      view: 'Title',
      label: 'With marks (logarithmic-style range)',
      styles: 'h4 margin-top-large margin-bottom-small',
    },
    {
      view: 'Text',
      children: 'Pass `range` to auto-build marks; pair with `step: null` to snap to mark points.',
      styles: 'margin-bottom',
    },
    {
      view: 'Input',
      type: 'slider',
      name: 'budget',
      range: [10, 50, 100, 500, 1000, 5000],
      rangeLabels: { isCurrency: true, currency: '$' },
      step: null,
      tooltipProps: {},
    },

    {
      view: 'Title',
      label: 'Percent formatting',
      styles: 'h4 margin-top-large margin-bottom-small',
    },
    {
      view: 'Input',
      type: 'slider',
      name: 'split',
      range: [0, 25, 50, 75, 100],
      rangeLabels: { isPercent: true, precision: 0 },
      step: null,
      tooltipProps: { render: 'Percent' },
    },

    {
      view: 'Title',
      label: 'Disabled',
      styles: 'h4 margin-top-large margin-bottom-small',
    },
    {
      view: 'Input',
      type: 'slider',
      name: 'disabledSlider',
      min: 0,
      max: 100,
      disabled: true,
    },
  ],
}

export default sliderMeta
