import request from 'supertest'
import mongoose from 'mongoose'

import { OrderStatus } from '@mhunt/ticketing-common'

import { app } from '../../app'
import { Ticket } from '../../models/Ticket'
import { Order } from '../../models/Order'

// Mocked
import { natsWrapper } from '../../events/natsWrapper'

it('cancells order with the given id for a user', async () => {
  const user = {
    email: 't@t.com',
    id: mongoose.Types.ObjectId().toString(),
  }

  const ticket = await Ticket.build({ title: 'test 1', price: 123 }).save()

  const order = await Order.build({
    status: OrderStatus.Created,
    ticket: ticket,
    userId: user.id,
    expiresAt: new Date(),
  }).save()

  const res = await request(app)
    .delete(`/api/orders/${order._id}`)
    .set('Cookie', global.signIn(user))

  expect(res.status).toBe(200)
  expect(res.body.status).toBe(OrderStatus.Cancelled)
})

it('Returns 404 if you try to cancel someone elses order', async () => {
  const user = {
    email: 't@t.com',
    id: mongoose.Types.ObjectId().toString(),
  }

  const ticket = await Ticket.build({ title: 'test 1', price: 123 }).save()

  const order = await Order.build({
    status: OrderStatus.Created,
    ticket: ticket,
    userId: user.id,
    expiresAt: new Date(),
  }).save()

  await request(app)
    .delete(`/api/orders/${order._id}`)
    .set('Cookie', global.signIn())
    .expect(404)
})

it('emits an order cancelled event', async () => {
  const user = {
    email: 't@t.com',
    id: mongoose.Types.ObjectId().toString(),
  }

  const ticket = await Ticket.build({ title: 'test 1', price: 123 }).save()

  const order = await Order.build({
    status: OrderStatus.Created,
    ticket: ticket,
    userId: user.id,
    expiresAt: new Date(),
  }).save()

  const res = await request(app)
    .delete(`/api/orders/${order._id}`)
    .set('Cookie', global.signIn(user))

  expect(res.status).toBe(200)
  expect(res.body.status).toBe(OrderStatus.Cancelled)

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
})
