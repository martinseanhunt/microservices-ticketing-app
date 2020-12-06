import makeserverSideRequest from './makeServerSideRequest'

export default async function getOrder({ params, req }) {
  const res = await makeserverSideRequest(`/api/orders/${params.orderId}`, req)

  return res?.data || {}
}
