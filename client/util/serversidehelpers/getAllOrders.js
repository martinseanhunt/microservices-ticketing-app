import makeserverSideRequest from './makeServerSideRequest'

export default async function getAllOrders({ req }) {
  const res = await makeserverSideRequest('/api/orders', req)

  return res?.data
}
