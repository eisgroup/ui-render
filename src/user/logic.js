import { _USER } from './definitions'

/**
 * BUSINESS LOGIC COMPUTATIONS =================================================
 * =============================================================================
 */

/**
 * Check if User has Staff or higher authorization based on User.auth
 */
export function hasStaffOrHigherAuth (auth) {
  return auth >= _USER.ROLE.STAFF._
}

/**
 * Check if User has Staff or higher permission based on User.role
 */
export function hasStaffOrHigherRole (role) {
  return role >= _USER.ROLE.STAFF._
}

/**
 * Check if given User.role is Staff
 */
export function isStaff (role) {
  return role === _USER.ROLE.STAFF._
}

/**
 * Check if given User.role is Admin
 */
export function isAdmin (role) {
  return role === _USER.ROLE.ADMIN._
}

/**
 * Check if given User.kind is Company
 */
export function isCompany (kind) {
  return kind === _USER.KIND.COMPANY._
}

/**
 * Check if given User.kind is Individual
 */
export function isIndividual (kind) {
  return !kind || kind === _USER.KIND.INDIVIDUAL._
}

/**
 * Check if given Instance or Object is of User Type
 *
 * @param {Object|Undefined} instance - to check, can be empty
 * @returns {Boolean} true - if it is
 */
export function isUserModel (instance) {
  return !!instance && (instance.lastLogin != null || instance.lastOnline != null || instance.surname != null)
}
