import { Link } from 'ui-modules-pack/router/browser'
import { ROUTE } from 'ui-modules-pack/variables'
import React, { PureComponent } from 'react'
import Image from 'ui-react-pack/Image'
import Row from 'ui-react-pack/Row'
import ScrollView from 'ui-react-pack/ScrollView'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * OpenL Homepage for http://mnsopenl.exigengroup.com/
 * -----------------------------------------------------------------------------
 */
export default class Dashboard extends PureComponent {
  render () {
    return (
      <ScrollView fill className="app__dashboard padding-smaller bg-gradient">
        <Row fill className="middle wrap spread">
          <Link className="img__swatch" style={card} to={ROUTE.DOCS}>
            <Image name="logo.svg"/>
          </Link>
          <Link className="img__swatch" style={card} to={ROUTE.ROCKET}>
            <Image name="rocket.png"/>
          </Link>
        </Row>
      </ScrollView>
    )
  }
}

const card = {width: 200, height: 200}
