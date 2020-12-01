import request from 'supertest'
import mongoose from 'mongoose'

import { OrderStatus } from '@mhunt/ticketing-common'

import { app } from '../../app'
import { Ticket } from '../../models/Ticket'
import { Order } from '../../models/Order'

const ticketId = () => mongoose.Types.ObjectId().toHexString()

it('fetches order with the given id for a user', async () => {
  const user1 = {
    email: 't@t.com',
    id: mongoose.Types.ObjectId().toString(),
  }
  const user2 = {
    email: 't@t.com',
    id: mongoose.Types.ObjectId().toString(),
  }

  const ticket = await Ticket.build({
    title: 'test 1',
    price: 123,
    id: ticketId(),
  }).save()
  const ticket2 = await Ticket.build({
    title: 'test 2',
    price: 123,
    id: ticketId(),
  }).save()

  const order1 = await Order.build({
    status: OrderStatus.Created,
    ticket: ticket,
    userId: user1.id,
    expiresAt: new Date(),
  }).save()

  const order2 = await Order.build({
    status: OrderStatus.Created,
    ticket: ticket2,
    userId: user2.id,
    expiresAt: new Date(),
  }).save()

  // get order 1
  const res = await request(app)
    .get(`/api/orders/${order1._id}`)
    .set('Cookie', global.signIn(user1))

  // check that we got the right order back
  expect(res.status).toBe(200)
  expect(res.body.ticket.title).toBe(ticket.title)
})

it('Returns 404 if you try to query someone elses order', async () => {
  const user1 = {
    email: 't@t.com',
    id: mongoose.Types.ObjectId().toString(),
  }
  const user2 = {
    email: 't@t.com',
    id: mongoose.Types.ObjectId().toString(),
  }

  const ticket = await Ticket.build({
    title: 'test 1',
    price: 123,
    id: ticketId(),
  }).save()
  const ticket2 = await Ticket.build({
    title: 'test 2',
    price: 123,
    id: ticketId(),
  }).save()

  const order1 = await Order.build({
    status: OrderStatus.Created,
    ticket: ticket,
    userId: user1.id,
    expiresAt: new Date(),
  }).save()

  const order2 = await Order.build({
    status: OrderStatus.Created,
    ticket: ticket2,
    userId: user2.id,
    expiresAt: new Date(),
  }).save()

  // get order 1
  const res = await request(app)
    .get(`/api/orders/${order2._id}`)
    .set('Cookie', global.signIn(user1))
    .expect(404)
})
