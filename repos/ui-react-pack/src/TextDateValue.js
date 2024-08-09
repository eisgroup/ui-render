import React, { useContext } from 'react'
import moment from 'moment'
import Text from './Text'
import ConfigContext from 'core/src/providers/ConfigProvider'

const TextDateValue = ({value, dateFormat = 'DD/MM/YYYY', ...props}) => {
    const config = useContext(ConfigContext)
    const formatedDate = moment(value).format(config.dateFormat || 'DD/MM/YYYY')

    return <Text>{formatedDate}</Text>
}

export default TextDateValue