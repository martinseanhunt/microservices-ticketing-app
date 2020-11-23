import request from 'supertest'
import { app } from '../../app'

// more tests would be good
it('it can fetch a list of tickets', async () => {
  const realFakeTickets = [
    {
      title: 'test',
      price: 123.0,
    },
    {
      title: 'test',
      price: 123.0,
    },
  ]

  const cookie = global.signIn()

  for (let t of realFakeTickets) {
    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send(t)
      .expect(201)
  }

  const res = await request(app).get('/api/tickets')

  expect(res.status).toBe(200)
  expect(res.body.length).toBe(2)
})

it('Returns empty array if no tickets', async () => {
  const res = await request(app).get('/api/tickets')

  expect(res.status).toBe(200)
  expect(res.body.length).toBe(0)
})
