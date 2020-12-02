import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { Ticket } from '../../models/Ticket'
import { natsWrapper } from '../../events/natsWrapper'

const id = mongoose.Types.ObjectId().toHexString()

it('returns 404 if the id doesnt exist', async () => {
  const res = await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signIn())
    .send({
      title: 'test',
      price: 12.4,
    })
    .expect(404)
})

it('returns 400 if the id is not a mongo id', async () => {
  await request(app)
    .put('/api/tickets/23452352')
    .set('Cookie', global.signIn())
    .send({
      title: 'test',
      price: 12.4,
    })
    .expect(400)
})

// Could refactor a lot of this. Just gettign it working
it('retirms 401 if user isnt authenticated', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'test',
      price: 12.4,
    })
    .expect(401)
})

it('returns 401 if the user doesnt own the ticket', async () => {
  const testUser = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: 'test@tst.com',
  }

  // create a ticket where the userID is different to our id
  const ticket = Ticket.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    title: '123',
    price: 12.5,
  })

  await ticket.save()

  // Try to update our newly created ticket
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    // sign in with our fake user
    .set('Cookie', global.signIn(testUser))
    .send({
      title: 'test',
      price: 12.4,
    })
    .expect(401)
})

it('returns 400 if the user provides an invalid title or price', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signIn())
    .send({
      title: 'test',
      price: 'beef',
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signIn())
    .send({
      title: {},
      price: 12.5,
    })
    .expect(400)
})

// again lots of refactor could be done here. Just getting it to work
it('updatest the ticket provided valid inputs', async () => {
  const testUser = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: 'test@tst.com',
  }

  // create a ticket where the userID is the same as our id
  const ticket = Ticket.build({
    userId: testUser.id,
    title: '123',
    price: 12.5,
  })

  await ticket.save()

  const updates = {
    title: 'test',
    price: 12.4,
  }

  // Try to update our newly created ticket
  const res = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    // sign in with our fake user
    .set('Cookie', global.signIn(testUser))
    .send(updates)

  expect(res.status).toBe(200)

  const { title, price, userId, id: ticketId } = res.body

  expect(title).toEqual(updates.title)
  expect(price).toEqual(updates.price)
  expect(userId).toEqual(testUser.id)

  // check the database
  const dbRecord = await Ticket.findById(ticketId)
  expect(dbRecord?.title).toEqual(title)
})

it('publishes an event', async () => {
  const testUser = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: 'test@tst.com',
  }

  // create a ticket where the userID is the same as our id
  const ticket = Ticket.build({
    userId: testUser.id,
    title: '123',
    price: 12.5,
  })

  await ticket.save()

  const updates = {
    title: 'test',
    price: 12.4,
  }

  // Try to update our newly created ticket
  const res = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    // sign in with our fake user
    .set('Cookie', global.signIn(testUser))
    .send(updates)

  expect(res.status).toBe(200)

  // this could be way better ;)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
  const testUser = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: 'test@tst.com',
  }

  // create a ticket where the userID is the same as our id
  const ticket = Ticket.build({
    userId: testUser.id,
    title: '123',
    price: 12.5,
  })

  // add an order id propery signalling the ticket is reserved
  ticket.set({ orderId: mongoose.Types.ObjectId().toHexString })

  await ticket.save()

  const updates = {
    title: 'test',
    price: 12.4,
  }

  // Try to update our newly created ticket
  const res = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    // sign in with our fake user
    .set('Cookie', global.signIn(testUser))
    .send(updates)

  // expect the bad request error
  expect(res.status).toBe(400)
})
