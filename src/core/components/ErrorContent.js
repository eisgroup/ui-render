import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { hasListValue } from 'ui-utils-pack'
import ErrorTable from './ErrorTable'
import View from './View'

/**
 * Error Alert Message Content - Pure Component.
 *
 * @param {Array} items - error objects
 * @param {*} props - other attributes to pass to `<Table>`
 * @returns {Object} - React table component
 */
export function ErrorContent ({
  items,
  ...props
}) {
  // Filter out User vs Server Errors
  const serverErrors = items.filter(({status, statusCode, code}) => (((status || statusCode || code) >= 500) || ((status || statusCode || code) == null)))
  const userErrors = items.filter(({status, statusCode, code}) => ((status || statusCode || code) < 500))
  return (
    <Fragment>
      {hasListValue(serverErrors) &&
      <View className='border radius'>
        <ErrorTable className='margin' isServerError items={serverErrors} {...props} />
      </View>
      }
      {hasListValue(userErrors) &&
      <View className={'border radius' + (hasListValue(serverErrors) ? ' margin-top' : '')}>
        <ErrorTable className='margin' items={userErrors} {...props} />
      </View>
      }
    </Fragment>
  )
}

ErrorContent.propTypes = {
  items: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
      id: PropTypes.any,
      status: PropTypes.number,
      title: PropTypes.string,
      detail: PropTypes.string,
      message: PropTypes.string
    })
  ])).isRequired
}

export default React.memo(ErrorContent)
