import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { Active } from '../../utils'
import {
  colorDropdownOptions,
  languageDropdownOptions,
  renderCurrency,
  renderFloat
} from '../renders'

const wrap = ui => (
  <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

describe('renders dropdown option contracts', () => {
  const originalLanguage = Active.LANG

  afterEach(() => {
    Active.LANG = originalLanguage
  })

  it('resolves color items from active language, English, then an empty fallback', () => {
    const active = {LANG: {_: 'pl'}}
    const options = colorDropdownOptions({
      RED: {_: [255, 0, 0], en: 'Red', pl: 'Czerwony'}
    }, active)

    expect(options.items).toBe(options.pl)
    expect(options.items[0]).toMatchObject({text: 'Czerwony', value: '255,0,0'})

    active.LANG._ = 'de'
    expect(options.items).toBe(options.en)
    expect(options.items[0].text).toBe('Red')

    const withoutEnglish = colorDropdownOptions({
      BLUE: {_: '0,0,255', fr: 'Bleu'}
    }, active)
    expect(withoutEnglish.items).toEqual([])
  })

  it('renders the public color option content with its swatch and translated text', () => {
    const options = colorDropdownOptions({
      BLACK: {_: '0,0,0', en: 'Black'}
    }, {LANG: {_: 'en'}})
    const { container, getByText } = render(wrap(options.en[0].content))

    expect(container.firstChild).toHaveClass('input--dropdown__option', 'middle')
    expect(container.querySelector('.color__swatch')).toHaveStyle({backgroundColor: 'rgb(0, 0, 0)'})
    expect(getByText('Black')).toHaveClass('margin-top-smallest')
  })

  it('resolves language items from active language, English, then an empty fallback', () => {
    const options = languageDropdownOptions({
      POLISH: {_: 'pl', lang: 'Polski', en: 'Polish', pl: 'Polski'}
    })

    Active.LANG = {_: 'pl'}
    expect(options.items).toBe(options.pl)
    expect(options.items[0].value).toBe('pl')

    Active.LANG = {_: 'de'}
    expect(options.items).toBe(options.en)
    expect(options.items[0].text).toBe('Polish Polski')

    const withoutEnglish = languageDropdownOptions({
      FRENCH: {_: 'fr', lang: 'Français', fr: 'Français'}
    })
    expect(withoutEnglish.items).toEqual([])
  })

  it('renders the non-selection language option as searchable text and flag content', () => {
    const options = languageDropdownOptions({
      POLISH: {_: 'pl', lang: 'Polski', en: 'Polish'}
    }, {selection: false})
    const option = options.en[0]
    const { container, getByText } = render(wrap(option.content))

    expect(option.text).toBe('Polish Polski')
    expect(container.querySelector('img')).toHaveAttribute('src', '/static/images/flags/pl.svg')
    expect(container.querySelector('img')).toHaveAttribute('alt', 'pl')
    expect(getByText('Polish')).toBeInTheDocument()
  })

  it('renders the selection language option as the uppercase code and flag', () => {
    const options = languageDropdownOptions({
      POLISH: {_: 'pl', lang: 'Polski', en: 'Polish'}
    }, {selection: true})
    const { container, getByText } = render(wrap(options.en[0].text))

    expect(container.querySelector('img')).toHaveAttribute('src', '/static/images/flags/pl.svg')
    expect(container.querySelector('img')).toHaveClass('margin-right-smaller')
    expect(getByText('PL')).toHaveClass('no-wrap')
  })
})

describe('renders numeric formatting contracts', () => {
  it('uses two decimals by default for currency amounts below 100', () => {
    const { container } = render(wrap(renderCurrency(12.3)))

    expect(container.firstChild).toHaveTextContent('12.30')
    expect(container.querySelector('.fade--quarter')).toHaveTextContent('.30')
  })

  it('uses no decimals by default for currency amounts at or above 100', () => {
    const { container } = render(wrap(renderCurrency(123.9)))

    expect(container.firstChild).toHaveTextContent('124')
    expect(container.querySelector('.fade--quarter')).not.toBeInTheDocument()
  })

  it('renders only the integer part when renderFloat has no decimals or props', () => {
    const { container } = render(wrap(renderFloat(1234.75)))

    expect(container.firstChild).toHaveTextContent('1,234')
    expect(container.firstChild).not.toHaveTextContent('75')
    expect(container.querySelector('.fade--quarter')).not.toBeInTheDocument()
  })

  it('truncates a fraction without rounding and fades it by default', () => {
    const { container } = render(wrap(renderFloat(12.349, 2, {truncated: true})))

    expect(container.firstChild).toHaveTextContent('12.34')
    expect(container.querySelector('.fade--quarter')).toHaveTextContent('.34')
  })

  it('rounds a fraction without fading and forwards remaining Text props', () => {
    const { container, getByTitle } = render(wrap(renderFloat(12.349, 2, {
      faded: false,
      className: 'plain-fraction',
      title: 'Rounded amount'
    })))

    const output = getByTitle('Rounded amount')
    expect(output).toHaveClass('plain-fraction')
    expect(output).toHaveTextContent('12.35')
    expect(container.querySelector('.fade--quarter')).not.toBeInTheDocument()
  })

  it('pads a missing fraction to the requested precision', () => {
    const { container } = render(wrap(renderFloat(7, 3)))

    expect(container.firstChild).toHaveTextContent('7.000')
    expect(container.querySelector('.fade--quarter')).toHaveTextContent('.000')
  })
})
