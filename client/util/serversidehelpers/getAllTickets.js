import makeserverSideRequest from './makeServerSideRequest'

export default async function getAllTickets({ req }) {
  try {
    const res = await makeserverSideRequest('/api/tickets', req)
  } catch (e) {
    console.error('something went wrong getting tickets')
    console.error(e)
  }
  return res?.data || []
}
