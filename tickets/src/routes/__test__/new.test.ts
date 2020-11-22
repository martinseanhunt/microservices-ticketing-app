import request from 'supertest'
import { app } from '../../app'

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
  const cookie = global.signIn()
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 234.0 })

  expect(res.status).toBe(200)
})
