import { OrderStatus } from '@mhunt/ticketing-common'
import mongoose from 'mongoose'
import request from 'supertest'

import { app } from '../../app'
import { Order } from '../../models/Order'
import { Payment } from '../../models/Payment'

// mocked (not acutally mocking this anymore)
import { stripe } from '../../lib/stripe'

// not mocking this for now as experimenting with using the real connection
// to the stripe deve environment for these tests
// mock the stripe api
// jest.mock('../../lib/stripe')

it('returns a 404 if the order doesnt exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn())
    .send({
      token: '213142',
      orderId: mongoose.Types.ObjectId(),
    })
    .expect(404)
})

it('returns a 401 if the order doesnt belong to the signed in user', async () => {
  const testuser = {
    email: 'm@test.com',
    id: mongoose.Types.ObjectId().toHexString(),
  }

  // not using the test user ID here because we want to simulate it
  // not belonigng to the user.
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 108,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn(testuser))
    .send({
      token: '213142',
      orderId: order.id,
    })
    .expect(401)
})

it('returns 400 when purhcasing a cancelled order', async () => {
  const testuser = {
    email: 'm@test.com',
    id: mongoose.Types.ObjectId().toHexString(),
  }

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 108,
    status: OrderStatus.Cancelled,
    userId: testuser.id,
    version: 0,
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn(testuser))
    .send({
      token: '213142',
      orderId: order.id,
    })
    .expect(400)
})

it('returns 201 with valid inputs', async () => {
  const testuser = {
    email: 'm@test.com',
    id: mongoose.Types.ObjectId().toHexString(),
  }

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: Math.floor(Math.random() * 100000),
    status: OrderStatus.Created,
    userId: testuser.id,
    version: 0,
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signIn(testuser))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)

  // We're not mocking this anymore as we're experimenting with allowing the test
  // to call the stripe api in test mode.
  /* 
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]

    expect(chargeOptions.source).toEqual('tok_visa')
    expect(chargeOptions.currency).toEqual('gbp')
    expect(chargeOptions.amount).toEqual(order.price * 100)
  */

  // Get the last 10 charges from the stripe api and make sure that the most recent one
  // has our randomly generated price.
  const charges = await stripe.charges.list({ limit: 10 })
  const charge = charges.data.find((c) => c.amount === order.price * 100)

  expect(charge).toBeTruthy()

  // expect that we successfully save the payment to our database
  const payment = await Payment.findOne({
    orderId: order.id,
  })

  expect(payment?.stripeId).toEqual(charge?.id)
})
