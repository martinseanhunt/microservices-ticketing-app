import { Heading, Box, Container } from '@chakra-ui/react'
import axios from 'axios'

import Layout from '../components/Layout/Layout'

export default function Home({ currentUser }) {
  return (
    <Layout currentUser={currentUser}>
      <Box>
        <Heading as="h1" size="lg" fontWeight="300">
          Welcome to{' '}
          <a href="https://nextjs.org">
            Ticketing.dev <b>{currentUser?.email}</b>!
          </a>
        </Heading>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  let currentUser = null
  try {
    // we need to request to ingress-nginx because if we just do /api/* then it will be makign
    // the request within the running container for this sevice
    const res = await axios.get('https://auth-srv/api/users/currentuser')
    currentUser = res.data.currentUser
  } catch (e) {
    console.error(e.message)
  }

  return {
    props: {
      currentUser,
    },
  }
}
