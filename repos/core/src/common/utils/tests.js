export const withMarkup = (query) => (text) => query((content, node) => {
  const hasText = (node) => node.textContent === text
  const childrenDontHaveText = Array.from(node.children).every(child => !hasText(child))
  return hasText(node) && childrenDontHaveText
})

