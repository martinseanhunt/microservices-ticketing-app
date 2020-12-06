import getCurrentUser from '../../util/serversidehelpers/getCurrentUser'

import Layout from '../../components/Layout/Layout'
import NewTicket from '../../components/NewTicket'

export default function CreateTicket({ currentUser }) {
  return (
    <Layout currentUser={currentUser}>
      <NewTicket />
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      currentUser: await getCurrentUser(context),
    },
  }
}
