import request from 'supertest'

import { app } from '../../app'
import { Ticket } from '../../models/Ticket'

// This is the mocked implementation
import { natsWrapper } from '../../events/natsWrapper'

// TDD approach here

it('has a route handler listening to /api/tickets/ for post reqs', async () => {
  const res = await request(app).post('/api/tickets').send({})
  expect(res.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
  const res = await request(app).post('/api/tickets').send({})
  expect(res.status).toBe(401)
})

it('allows a user to access the route if signed in', async () => {
  const cookie = global.signIn()
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({})
  expect(res.status).not.toBe(401)
})

it('returns an error if an invalid title is provided', async () => {
  const cookie = global.signIn()
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: null, price: '12' })

  expect(res.status).toBe(400)
})

it('returns an error if an invalid price is provided', async () => {
  const cookie = global.signIn()
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: -234 })

  expect(res.status).toBe(400)
})

it('creates a ticket with valid inputs', async () => {
  // Checking the ticket was added to the database.
  // See how many records there are now
  let tickets = await Ticket.find({})

  // Should always be 0 because we're clearing them before each test in setup.ts
  expect(tickets.length).toBe(0)

  const cookie = global.signIn()
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 234.0 })

  // Now check the tickets colelction again and see if there is one more entry
  tickets = await Ticket.find({})
  expect(tickets.length).toBe(1)

  // Noew we can make assertions on the record iteslf: title should be a var - being lazy
  expect(tickets[0].title).toBe('test')

  expect(res.status).toBe(201)
})

it('publishes an event', async () => {
  // Checking the ticket was added to the database.
  // See how many records there are now
  let tickets = await Ticket.find({})

  // Should always be 0 because we're clearing them before each test in setup.ts
  expect(tickets.length).toBe(0)

  const cookie = global.signIn()
  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 234.0 })
    .expect(201)

  // this could be way better ;)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

// Test to see that the ticket object is actually returned from creation
