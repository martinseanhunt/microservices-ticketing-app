import makeserverSideRequest from './makeServerSideRequest'

export default async function getCurrentUser({ req }) {
  const res = await makeserverSideRequest('/api/users/currentuser', req)
  return res ? res.data?.currentUser : null
}
