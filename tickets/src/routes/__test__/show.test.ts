// I really don't like the filenames SG is using for these routes

import request from 'supertest'

import { app } from '../../app'
import mongoose from 'mongoose'

it('returns a 404 if no ticket is found', async () => {
  // using a generated object ID so mongo doesn't error
  const id = mongoose.Types.ObjectId().toHexString()
  await request(app)
    .get(`/api/tickets/${id}`)
    .set('Cookie', global.signIn())
    .send()
    .expect(404)
})

it('returns the ticket if it is found', async () => {
  // Couple of ooptions for this tets... We could either create a
  // new entry in our database right here and then try to find it
  // via the route.

  // or we can go a more integration approach and send a post request to our
  // route respoinsible for creating the ticket and then follow up with a request
  // to the route we're trying to test here.

  const ticketAttrs = {
    title: 'tset',
    price: 12.5,
  }

  const res = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signIn())
    .send(ticketAttrs)
    .expect(201)

  const ticketRes = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .expect(200)

  expect(ticketRes.body.title).toBe(ticketAttrs.title)
})
