import { Heading, Box } from '@chakra-ui/react'
import Link from 'next/link'

import getCurrentUser from '../../util/serversidehelpers/getCurrentUser'

import Layout from '../../components/Layout/Layout'
import getAllOrders from '../../util/serversidehelpers/getAllOrders'

export default function Home({ currentUser, orders }) {
  console.log(orders)

  return (
    <Layout currentUser={currentUser} render>
      <Heading as="h1" size="lg" fontWeight="300">
        My orders
      </Heading>
      {orders &&
        orders.map((o) => (
          <Link href={`/orders/${o.id}`} key={o.id}>
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
                      {o.ticket.title}
                    </Box>
                  </Box>

                  <Box>£{o.ticket.price}</Box>
                  <Box>Status: {o.status}</Box>
                </Box>
              </Box>
            </a>
          </Link>
        ))}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      currentUser: await getCurrentUser(context),
      orders: await getAllOrders(context),
    },
  }
}
