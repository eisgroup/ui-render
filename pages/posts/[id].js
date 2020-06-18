/**
 * Load page with initial props
 * @returns {Promise<{props: {}}>}
 */
export async function getStaticProps({ params }) {
  // Fetch necessary data for the blog post using params.id
  return {
    props: {}
  }
}

/**
 * Server Side Rendering with data loaded per request
 *
 * @param context
 * @returns {Promise<{props: {}}>}
 */
export async function getServerSideProps(context) {
  return {
    props: {
      // props for your component
    }
  }
}

/**
 * Dynamic Routes Definition
 * @returns {Promise<void>}
 */
export async function getStaticPaths() {
  // Return a list of possible value for id
}
