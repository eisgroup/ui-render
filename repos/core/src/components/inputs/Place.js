import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ALERT, stateAction } from '../../common/actions'
import { connect } from '../../common/redux'
import { createScript, debounceBy, get, isInList, warn } from '../../common/utils'
import { ACTIVE } from '../../common/variables'
import { POPUP } from '../../modules/exports'
import Dropdown from '../Dropdown'
import Row from '../Row'
import Text from '../Text'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapDispatchToProps = (dispatch) => ({
  actions: {
    popupAlert: (message) => dispatch(stateAction(POPUP, ALERT, {
      items: [{
        title: 'An Error Has Occurred!',
        content: message,
        closeLabel: 'Ok'  // optional
      }]
    })),
  }
})
let hasLoadedScript

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Address Input Field powered by Google Places Autocomplete
 * -----------------------------------------------------------------------------
 */
@connect(null, mapDispatchToProps)
export default class Place extends Component {
  static propTypes = {
    value: PropTypes.shape({ // PlaceInput
      id: PropTypes.string.isRequired, // placeId
      address: PropTypes.string.isRequired, // full address
    }),
    apiKey: PropTypes.shape({key: PropTypes.string.isRequired}).isRequired, // required
    onChange: PropTypes.func, // callback when a place is selected, receives PlaceInput as argument with sessionToken
    onError: PropTypes.func, // callback when Google Maps API responds with an error
    searchOptions: PropTypes.object, // to pass to to Google Places API, like bounds, types of result, etc.
  }

  state = {
    error: undefined,
    loading: false,
    options: [],
    input: '',
  }

  /**
   * For billing purpose we should create session tokens.
   * The session begins when the user starts typing a query, and concludes when they select a place.
   * Each session can have multiple queries, followed by one place selection.
   * If the `sessiontoken` parameter is omitted, or if you reuse a session token,
   * the session is charged as if no session token was provided (each request is billed separately).
   */
  get session () {
    if (!this._session) {
      try {
        this._session = new window.google.maps.places.AutocompleteSessionToken()
      } catch (err) {
        warn(err)
      }
    }
    return this._session
  }

  get sessionToken () {
    for (const key in this.session) {
      const token = this.session[key]
      if (token && typeof token === 'string') return token
    }
  }

  get inputProps () {
    let {
      value, label, hint, placeholder, required, disabled,
      multiple, done, error, info, float,
      onBlur, onFocus, onDrop, onDragStart,
      className, style, fill
    } = this.props
    error = error || this.state.error
    if (value) value = value.id
    return {
      value, label, hint, placeholder, required, disabled,
      multiple, done, error, info, float,
      onBlur, onFocus, onDrop, onDragStart,
      className, style, fill
    }
  }

  get options () {
    const {value} = this.props
    let {options, input} = this.state

    // Always add selected value to options so it is visible
    if (value && !options.find(o => o.value === value.id)) options = [...options, {
      text: value.address,
      value: value.id
    }]

    // Branding Requirements
    const brand = <Text className='right'>{'powered by Google'}</Text>
    options = [...options, {
      key: '',
      text: input,
      disabled: true,
      content: options.length
        ? <Row className='right'>{brand}</Row>
        : <Row className='justify'><Text>{input ? 'No places found' : 'Enter address'}</Text>{brand}</Row>
    }]
    return options
  }

  @debounceBy(300)
  handleSearch (input) {
    if (input.length < 3) return
    if (!this.autocompleteService) return warn(`${this.constructor.name}.autocompleteService not loaded, check connection`)
    this.autocompleteService.getPlacePredictions(
      {
        // @note: types: ['address'] does not work, better return all
        // types: ['geocode', 'establishment'],
        language: ACTIVE.LANG.code,
        ...this.props.searchOptions,
        input,
        sessionToken: this.session
      },
      this.autocompleteCallback
    )
    this.setState({loading: true, input})
  }

  handleSelect = (placeId) => {
    const selected = this.state.options.find(o => o.value === placeId) || {}
    if (!selected.text) return
    if (selected.text.indexOf('{') > 0) selected.text = selected.text.slice(0, selected.text.indexOf('{'))
    if (this.props.onChange) {
      const {text: address, value: id} = selected
      this.props.onChange({id, address, sessionToken: this.sessionToken})
    }
    this.clearSuggestions(placeId)
  }

  clearSuggestions = (placeId) => {
    this.setState({options: this.state.options.filter(o => o.value === placeId)})
  }

  autocompleteCallback = (predictions, status) => {
    if (!isInList(this.OK_STATUSES, status)) {
      if (this.props.onError) this.props.onError(status)
      return this.setState({error: status, loading: false})
    }
    this.setState({
      error: null,
      loading: false,
      options: (predictions || []).map((p) => ({
        text: p.description + '{' + this.state.input + '}',
        value: p.place_id,
        content: <Text className='input--dropdown__option bottom'>
          {(() => {
            const texts = []
            let endIndex = 0
            p.matched_substrings.forEach(({offset, length}, i, array) => {
              if (offset > endIndex) texts.push({start: endIndex, end: offset})
              endIndex = offset + length
              texts.push({start: offset, end: endIndex, bold: true})
              if (i === array.length - 1 && endIndex - 1 < p.description.length) texts.push({start: endIndex})
            })
            return texts.map(({start, end, bold}, i) => (
              <Text key={i} className={classNames('no-margin', {bold})}>{p.description.slice(start, end)}</Text>
            ))
          })()}
        </Text>
      })),
    })
  }

  init = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      if (!hasLoadedScript) { // must load script because pure API has CORS blocking
        const apiKey = get(this.props, 'apiKey.key')
        if (!apiKey) return this.props.actions.popupAlert(`API Key not found for ${this.constructor.name}`)
        createScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`, this.init)
        hasLoadedScript = true
        return
      }
    }
    try {
      this.autocompleteService = new window.google.maps.places.AutocompleteService()
      const {OK, ZERO_RESULTS} = window.google.maps.places.PlacesServiceStatus
      this.OK_STATUSES = [OK, ZERO_RESULTS]
    } catch (err) {
      warn(err)
    }
  }

  componentDidMount () {
    this.init()
  }

  render () {
    let {loading} = this.state
    return <Dropdown
      search selection
      loading={loading}
      {...this.inputProps}
      options={this.options}
      onSearch={(input) => this.handleSearch(input)}
      onSelect={this.handleSelect}
      noResultsMessage='Searching...'
    />
  }
}
