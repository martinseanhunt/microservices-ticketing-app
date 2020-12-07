import makeserverSideRequest from './makeServerSideRequest'

export default async function getAllTickets({ req }) {
  let res
  try {
    res = await makeserverSideRequest('/api/tickets', req)
  } catch (e) {
    console.error('something went wrong getting tickets')
    console.error(e)
  }

  console.log(res)

  return res?.data || []
}
