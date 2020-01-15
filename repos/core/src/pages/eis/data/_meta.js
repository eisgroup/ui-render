export default {
  'view': 'Expand',
  'title': 'Admin Expenses',
  'className': 'border-gradient-h-right',
  'items': [
    {
      'view': 'Col',
      'items': [
        {
          'view': 'Title',
          'children': 'Fully Insured'
        },
        {
          'view': 'Input',
          'label': 'Number of claims per employee',
          'name': 'adminExpenses.perEmployeeClaims',
          'type': 'number',
          'min': 1
        },
        {
          'view': 'Table',
          'items': [
            {
              'adminCost': 2,
              'accountCost': 3,
              'perPerson': '20%'
            }
          ]
        }
      ]
    }
  ]
}
