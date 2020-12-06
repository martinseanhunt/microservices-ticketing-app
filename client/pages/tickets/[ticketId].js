import { useRouter } from 'next/router'
import {
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

import useRequest from '../../hooks/useRequest'
import getCurrentUser from '../../util/serversidehelpers/getCurrentUser'
import getTicket from '../../util/serversidehelpers/getTicket'

import Layout from '../../components/Layout/Layout'

export default function Ticket({ currentUser, ticket }) {
  const router = useRouter()

  const { doRequest, isSubmitting, errors } = useRequest({
    url: '/api/orders',
    method: 'POST',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (data) => {
      router.push(`/orders/${data.id}`)
    },
  })

  const purchaseTicket = () => doRequest()

  return (
    <Layout currentUser={currentUser}>
      {!ticket.title ? (
        <div>Ticket not found with ID</div>
      ) : (
        <div>
          <p>Title: {ticket.title}</p>
          <p>Price: {ticket.price}</p>

          <Button
            size="sm"
            colorScheme="pink"
            variant="outline"
            onClick={purchaseTicket}
            isLoading={isSubmitting}
            marginY="5"
          >
            Purchase ticket
          </Button>

          {errors?.map((e) => (
            <Alert status="error" mb={5} key={e.message}>
              <AlertIcon />
              <AlertTitle mr={2} textTransform="capitalize">
                {e.field} error!
              </AlertTitle>
              <AlertDescription>{e.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      currentUser: await getCurrentUser(context),
      ticket: await getTicket(context),
    },
  }
}
