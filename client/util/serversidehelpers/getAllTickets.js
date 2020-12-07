import makeserverSideRequest from './makeServerSideRequest'

export default async function getAllTickets({ req }) {
  const res = await makeserverSideRequest('/api/tickets', req)

  return res?.data || []
}
