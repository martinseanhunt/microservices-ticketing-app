import makeserverSideRequest from './makeServerSideRequest'

export default async function getTicket({ params, req }) {
  const res = await makeserverSideRequest(
    `/api/tickets/${params.ticketId}`,
    req
  )

  return res?.data || {}
}
