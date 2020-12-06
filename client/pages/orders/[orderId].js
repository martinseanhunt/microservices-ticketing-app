import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import StripeCheckout from 'react-stripe-checkout'

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
    url: '/api/payments',
    method: 'POST',
    body: {
      orderId: order.id,
    },
    onSuccess: (data) => {
      console.log(data)
      router.push(`/orders`)
    },
  })

  const handleToken = (token) => {
    doRequest({ token: token.id })
  }

  console.log(order.status)

  const expired = timeLeft < 1 || order.status === 'Cancelled'

  if (order?.status === 'complete')
    return (
      <Layout currentUser={currentUser}>
        <div>Your purchase was successful</div>
      </Layout>
    )

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

              <StripeCheckout
                token={handleToken}
                stripeKey="pk_test_51Hv4IwDJfkPtdHtDhljhiSKwrF6NOuVPA3YNaNf4tnKdBXgLu5h0Lh5KogjMe0XO5iX7gpv3r789FYZzSOi1IcrE00S11YgcEc"
                amount={order.ticket.price * 100}
                email={currentUser.email}
                currency="GBP"
              />

              {/*
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
              */}

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
