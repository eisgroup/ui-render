import { tracking } from 'ui-modules-pack/tracking/utils'
import React, { PureComponent } from 'react'
import { cn } from 'ui-react-pack'
import Icon from 'ui-react-pack/Icon'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { interpolateString, l, localiseTranslation } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import { withUserFetch } from '../requests'

/**
 * Referral User Info Snippet that fetches GraphQL for given User `id` to check if user exists.
 * The User `id` is automatically retrieved from `Tracking ` module.
 * @param {Object} props - {
 *    onReset: Function, - callback when User clicks on reset link
 *    [canReset]: Boolean - whether to  always allow resetting referral code
 *  }
 */
export function ReferralStatus (props) {
  const {val: id} = tracking.getReferrer()
  if (!id) return <Text><Icon name="alert-circle"/>{_.NO_REFERRAL_CODE_FOUND}</Text>
  return <ReferralUser {...props} id={id}/>
}

@withUserFetch // gqlDecorator can only decorate classes for chained requests
class ReferralUser extends PureComponent {
  render () {
    const {user = {}, onReset, canReset, className, style} = this.props
    const isValid = !!user.id
    const message = isValid
      ? interpolateString(_.REFERRED_BY_name_surname, user, {suppressError: true})
      : _.INVALID_REFERRAL_CODE
    return <View className={cn('fade-in-down', className)} style={style}>
      <Text className={'p ' + (isValid ? 'success' : 'error')}>
        <Icon name={isValid ? 'check-circle' : 'cross-circle'}/>{message}
        {(canReset || !isValid) &&
        <Text className="margin-left-smaller">
          - <Text className="a" onClick={onReset}>{_.RESET}</Text>
        </Text>
        }
      </Text>
    </View>
  }
}

localiseTranslation({
  INVALID_REFERRAL_CODE: {
    [l.ENGLISH]: `Invalid referral code!`,
  },
  NO_REFERRAL_CODE_FOUND: {
    [l.ENGLISH]: `No referral code found!`,
  },
  REFERRED_BY_name_surname: {
    [l.ENGLISH]: `Referred by {name} {surname}.`,
  },
})
