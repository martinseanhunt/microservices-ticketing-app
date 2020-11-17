import { Heading, Box } from '@chakra-ui/react'

import getCurrentUser from '../util/serversidehelpers/getCurrentUser'

import { useCurrentUser } from '../contexts/CurrentUser'
import Layout from '../components/Layout/Layout'

export default function Home({ currentUser }) {
  return (
    <Layout currentUser={currentUser} render>
      <HomeContent />
    </Layout>
  )
}

// seperate component so we can use the useCurrentook to get the
// value of curentUser from the context rather from the serverside which
// is just used to initialise the context. The currentuser prop coming from
// serverside will go stale until route change if we sign the user out etc
const HomeContent = () => {
  const { currentUser } = useCurrentUser()

  return (
    <Box>
      <Heading as="h1" size="lg" fontWeight="300">
        Welcome to{' '}
        <a href="https://nextjs.org">
          Ticketing.dev <b>{currentUser?.email}</b>!
        </a>
      </Heading>
    </Box>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      currentUser: await getCurrentUser(context),
    },
  }
}
