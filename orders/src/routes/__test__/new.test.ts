import request from 'supertest'
import mongoose from 'mongoose'

import { OrderStatus } from '@mhunt/ticketing-common'

import { app } from '../../app'
import { Ticket } from '../../models/Ticket'
import { Order } from '../../models/Order'

// This is the mocked nats wrapper
import { natsWrapper } from '../../events/natsWrapper'

const URI = '/api/orders'

const ticketId = mongoose.Types.ObjectId().toString()

it('Returns 401 if no authed user', async () => {
  await request(app)
    .post(URI)
    .send({
      ticketId: mongoose.Types.ObjectId(),
    })
    .expect(401)
})

it('Returns 403 if invalid ticket ID', async () => {
  await request(app)
    .post(URI)
    .set('Cookie', global.signIn())
    .send({
      ticketId: '123',
    })
    .expect(400)
})

it('Returns 404 if no ticket is found with the ID supplied', async () => {
  await request(app)
    .post(URI)
    .set('Cookie', global.signIn())
    .send({
      ticketId: mongoose.Types.ObjectId(),
    })
    .expect(404)
})

it('returns 400 if the ticket is already reserved', async () => {
  const user = {
    email: 'test@test.com',
    id: mongoose.Types.ObjectId().toString(),
  }

  const cookie = global.signIn(user)

  // Create a ticket
  const ticket = Ticket.build({ title: 'some title', price: 123, id: ticketId })
  await ticket.save()

  // Create an order where the status is awaiting payment associated
  // with the ticket
  const order = Order.build({
    status: OrderStatus.AwaitingPayment,
    ticket: ticket,
    userId: user.id,
    expiresAt: new Date(),
  })
  await order.save()

  await request(app)
    .post(URI)
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(400)
})

it('Creates an order when a valid ID is passed and theres no order associated with the ticket', async () => {
  // Create a ticket
  const ticket = Ticket.build({ title: 'some title', price: 123, id: ticketId })
  await ticket.save()

  const res = await request(app)
    .post(URI)
    .set('Cookie', global.signIn())
    .send({ ticketId: ticket.id })

  expect(res.status).toBe(201)

  // check that it saved to the DB correctly
  const order = await Order.findById(res.body.id)

  expect(order).toBeTruthy()
  expect(order?.ticket.toString()).toBe(ticket.id)
  expect(order?.status).toEqual(OrderStatus.Created)
})

it('Creates an order when a valid ID is passed and the existing order assicated tp the ticket is cancelled', async () => {
  const user = {
    email: 'test@test.com',
    id: mongoose.Types.ObjectId().toString(),
  }

  const cookie = global.signIn(user)

  // Create a ticket
  const ticket = Ticket.build({ title: 'some title', price: 123, id: ticketId })
  await ticket.save()

  // Create an order where the status is awaiting payment associated
  // with the ticket
  const order = Order.build({
    status: OrderStatus.Cancelled,
    ticket: ticket,
    userId: user.id,
    expiresAt: new Date(),
  })
  await order.save()

  const res = await request(app)
    .post(URI)
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201)

  expect(res.status).toBe(201)

  // check that it saved to the DB correctly
  const createdOrder = await Order.findById(res.body.id)

  expect(createdOrder).toBeTruthy()
  expect(createdOrder?.ticket.toString()).toBe(ticket.id)
  expect(createdOrder?.status).toEqual(OrderStatus.Created)
})

it('Should publish an event on success', async () => {
  const ticket = Ticket.build({ title: 'some title', price: 123, id: ticketId })
  await ticket.save()

  const res = await request(app)
    .post(URI)
    .set('Cookie', global.signIn())
    .send({ ticketId: ticket.id })

  expect(res.status).toBe(201)

  // check that it saved to the DB correctly
  const order = await Order.findById(res.body.id)

  expect(order).toBeTruthy()
  expect(order?.ticket.toString()).toBe(ticket.id)
  expect(order?.status).toEqual(OrderStatus.Created)

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
})
