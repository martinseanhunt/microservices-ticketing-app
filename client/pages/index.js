import { Heading, Box } from '@chakra-ui/react'
import Link from 'next/link'

import getCurrentUser from '../util/serversidehelpers/getCurrentUser'
import makeserverSideRequest from '../util/serversidehelpers/makeServerSideRequest'

import { useCurrentUser } from '../contexts/CurrentUser'
import Layout from '../components/Layout/Layout'
import getAllTickets from '../util/serversidehelpers/getAllTickets'

export default function Home({ currentUser, tickets }) {
  return (
    <Layout currentUser={currentUser} render>
      <HomeContent tickets={tickets} />
    </Layout>
  )
}

// seperate component so we can use the useCurrentook to get the
// value of curentUser from the context rather from the serverside which
// is just used to initialise the context. The currentuser prop coming from
// serverside will go stale until route change if we sign the user out etc
const HomeContent = ({ tickets }) => {
  const { currentUser } = useCurrentUser()

  console.log(tickets)

  return (
    <Box>
      <Heading as="h1" size="lg" fontWeight="300">
        Welcome to{' '}
        <a href="https://nextjs.org">
          Ticketing.dev <b>{currentUser?.email}</b>!
        </a>
      </Heading>

      {tickets &&
        tickets.map((t) => (
          <Link href={`/tickets/${t.id}`} key={t.id}>
            <a>
              <Box
                marginTop="5"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
              >
                <Box p="6">
                  <Box d="flex" alignItems="baseline">
                    <Box
                      color="gray.500"
                      fontWeight="semibold"
                      letterSpacing="wide"
                      fontSize="xs"
                      textTransform="uppercase"
                    >
                      {t.title}
                    </Box>
                  </Box>

                  <Box>£{t.price}</Box>
                </Box>
              </Box>
            </a>
          </Link>
        ))}
    </Box>
  )
}

export async function getServerSideProps(context) {
  const tickets = await makeserverSideRequest('/api/tickets', context.req)

  return {
    props: {
      currentUser: await getCurrentUser(context),
      tickets: await getAllTickets(context),
    },
  }
}
