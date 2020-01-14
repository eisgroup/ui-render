import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { logRender } from '../../common/utils'
import { APP_NAME } from '../../common/variables'
import Button from '../../components/Button'
import Row from '../../components/Row'
import ScrollView from '../../components/ScrollView'
import Buttons from './Buttons'
import Dropdowns from './Dropdowns'
import Forms from './Forms'
import Layouts from './Layouts'

@logRender
export default class Theme extends Component {
  state = {
    activeIndex: 3,
    items: [
      {name: 'Buttons', content: Buttons},
      {name: 'Dropdowns', content: Dropdowns},
      {name: 'Inputs', content: Forms},
      {name: 'Layouts', content: Layouts},
    ]
  }

  render () {
    const { activeIndex, items } = this.state
    const Content = items[activeIndex].content
    return (
      <ScrollView className='app__page fade-in-left padding padding-bottom-largest'>
        <Helmet title={`${APP_NAME} Theme Demo`}/>
        <Row className='center wrap margin'>
          {items.map(({ name }, i) => (
            <Button key={name || i} className={activeIndex === i ? 'primary' : 'transparent'}
                    onClick={() => this.setState({ activeIndex: i })}>{name}</Button>
          ))}
        </Row>
        <Content/>
      </ScrollView>
    )
  }
}
