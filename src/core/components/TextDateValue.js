import React, { useContext } from 'react'
import moment from 'moment'
import Text from './Text'
import { ConfigContext } from '../contexts'

/**
 * Read-only date value.
 *
 * @Note: the `dateFormat` prop used to be declared and then ignored — the component read
 * the context and nothing else, so the prop it advertised did nothing (UPGRADE-PLAN
 * §2.6-2). An explicitly given format now wins over the configured one, which is the
 * order every other prop-over-context pair in the codebase follows.
 *
 * @param {*} value - anything moment can read
 * @param {String} [dateFormat] - moment format tokens; defaults to the configured format
 * @returns {JSX.Element} the formatted date
 */
const TextDateValue = ({value, dateFormat}) => {
    const config = useContext(ConfigContext)

    return <Text>{moment(value).format(dateFormat || config.dateFormat || 'DD/MM/YYYY')}</Text>
}

export default TextDateValue
