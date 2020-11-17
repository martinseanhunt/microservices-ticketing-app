import getCurrentUser from '../util/serversidehelpers/getCurrentUser'

import Layout from '../components/Layout/Layout'
import AuthForm from '../components/AuthForm'

export default function SignUp({ currentUser }) {
  return (
    <Layout currentUser={currentUser}>
      <AuthForm
        apiUrl={'/api/users/signup'}
        title="Join us! You know you want to"
      />
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
