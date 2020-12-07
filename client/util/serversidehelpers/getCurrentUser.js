import makeserverSideRequest from './makeServerSideRequest'

export default async function getCurrentUser({ req }) {
  let res
  try {
    res = await makeserverSideRequest('/api/users/currentuser', req)
  } catch (e) {
    console.error('something went wrong')
    console.error(e)
  }

  return res?.data?.currentUser || null
}
