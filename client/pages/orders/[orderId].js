import { useState, useEffect } from 'react'
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
import getOrder from '../../util/serversidehelpers/getOrder'

import Layout from '../../components/Layout/Layout'

export default function Ticket({ currentUser, order }) {
  const router = useRouter()

  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    setTimeLeft(Math.floor((new Date(order.expiresAt) - new Date()) / 1000))

    const interval = setInterval(() => {
      setTimeLeft((timeLeft) => timeLeft - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const { doRequest, isSubmitting, errors } = useRequest({
    url: '/api/orders',
    method: 'POST',
    body: {
      orderId: order.id,
    },
    onSuccess: (data) => {
      router.push(`/orders/${order.id}`)
    },
  })

  const purchaseTicket = () => doRequest()

  const expired = timeLeft < 1 || order.status === 'Cancelled'

  return (
    <Layout currentUser={currentUser}>
      {!order?.ticket?.price ? (
        <div>Order not found with ID</div>
      ) : (
        <>
          {expired ? (
            <div>Your order has expired!</div>
          ) : (
            <div>
              <p>
                Purchasing {order.ticket.title} for ${order.ticket.price}
              </p>

              <p>Your order expires in {timeLeft} seconds</p>

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
        </>
      )}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      currentUser: await getCurrentUser(context),
      order: await getOrder(context),
    },
  }
}
