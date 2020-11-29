import request from 'supertest'
import mongoose from 'mongoose'

import { OrderStatus } from '@mhunt/ticketing-common'

import { app } from '../../app'
import { Ticket } from '../../models/Ticket'
import { Order } from '../../models/Order'

it('fetches orders for a user', async () => {
  // create some tickets
  const tickets = [
    await Ticket.build({ title: 'test 1', price: 123 }).save(),
    await Ticket.build({ title: 'test 2', price: 424 }).save(),
    await Ticket.build({ title: 'test 3', price: 535 }).save(),
  ]

  // create one order as usr 1
  const user1 = {
    email: 'dawda@awd.com',
    id: mongoose.Types.ObjectId().toString(),
  }

  await Order.build({
    status: OrderStatus.Created,
    ticket: tickets[0],
    userId: user1.id,
    expiresAt: new Date(),
  }).save()

  // create 2 orders as user 2
  const user2 = {
    email: 'd@awawd.com',
    id: mongoose.Types.ObjectId().toString(),
  }

  tickets
    .filter((t, i) => i > 0)
    .forEach(async (t) => {
      await Order.build({
        status: OrderStatus.Created,
        ticket: tickets[0],
        userId: user2.id,
        expiresAt: new Date(),
      }).save()
    })

  // get orers for user 2
  const res = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signIn(user2))

  // check that we only got the orders for user 2
  expect(res.status).toBe(200)
  expect(res.body.length).toBe(2)

  for (let o of res.body) {
    expect(o.userId).toEqual(user2.id)
  }
})
