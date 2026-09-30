import React, { useContext } from 'react'
import moment from 'moment'
import Text from './Text'
import { ConfigContext } from '../contexts'

export type TextDateValueProps = {
    /** Anything moment can read */
    value?: moment.MomentInput
    /** Moment format tokens; defaults to the configured format */
    dateFormat?: string
}

/** The part of ConfigContext this component reads. */
type DateConfig = { dateFormat?: string }

/**
 * Read-only date value.
 *
 * @Note: the `dateFormat` prop used to be declared and then ignored — the component read
 * the context and nothing else, so the prop it advertised did nothing (UPGRADE-PLAN
 * §2.6-2). An explicitly given format now wins over the configured one, which is the
 * order every other prop-over-context pair in the codebase follows.
 *
 * @returns {JSX.Element} the formatted date
 */
const TextDateValue = ({value, dateFormat}: TextDateValueProps) => {
    // A cast, not a guard: outside a provider the context is `undefined` and this read throws, as it did before.
    const config = useContext(ConfigContext) as DateConfig

    return <Text>{moment(value).format(dateFormat || config.dateFormat || 'DD/MM/YYYY')}</Text>
}

export default TextDateValue
