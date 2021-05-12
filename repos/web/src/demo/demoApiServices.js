const initialValues = {
  test: 'test',
}

export const apiServices = {
  loadInitialValues: () => Promise.resolve(initialValues),
  redirect: () => Promise.resolve('http://example.org'),
  test: () => Promise.resolve(),
}
