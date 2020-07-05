import { distanceBetween } from '../utility'

it(`${distanceBetween.name}() returns correct distance between two points in millimeters`, () => {
  const point1 = {lat: 40.714, lng: -74.00599999999997}
  const point2 = {lat: 48.857, lng: 2.3519999999999754}
  const distance = 5843670761.836855 // using google.maps.geometry.spherical.computeDistanceBetween
  expect(distanceBetween(point1, point2)).toEqual(distance)
})
