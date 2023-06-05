import React, { Component } from 'react'
import Helmet from 'react-helmet'
import Button from 'ui-react-pack/Button'
import Row from 'ui-react-pack/Row'
import ScrollView from 'ui-react-pack/ScrollView'
import { APP_NAME } from '../../common/variables'
import Buttons from './Buttons'
import Charts from './Charts'
import Dropdowns from './Dropdowns'
import Forms from './Forms'
import Layouts from './Layouts'

export default class Theme extends Component {
  state = {
    activeIndex: 1,
    items: [
      {name: 'Buttons', content: Buttons},
      {name: 'Charts', content: Charts},
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
