import { OrderStatus } from '@mhunt/ticketing-common'
import mongoose from 'mongoose'
import request from 'supertest'

import { app } from '../../app'
import { Order } from '../../models/Order'

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
