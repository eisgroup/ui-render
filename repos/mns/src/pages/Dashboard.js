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
          <Link className="img__swatch" to={ROUTE.DOCS} style={card}>
            <Image name="logo.svg" style={card} />
          </Link>
          <Link className="img__swatch" to={ROUTE.EARTH} style={card}>
            <Image name="earth.png" style={card} />
          </Link>
          <Link className="img__swatch" to={ROUTE.ROCKET} style={card}>
            <Image name="rocket.png" style={card} />
          </Link>
          <Link className="img__swatch" to={ROUTE.CANOPY} style={card}>
            <Image name="canopy.jpg" style={card} />
          </Link>
        </Row>
      </ScrollView>
    )
  }
}

const card = {width: 200, height: 200}
