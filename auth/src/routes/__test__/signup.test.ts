import request from 'supertest'
import { app } from '../../app'

// Make sure to do Kent C Dodds course before writing tests for my own apps.
// I feel like these could be a lot better.

const API_ROUTE = '/api/users/signup'

it('Responds with correct status on signup', () => {
  return request(app)
    .post(API_ROUTE)
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)
})

it('responds with an error on invalid email', () => {
  return request(app)
    .post(API_ROUTE)
    .send({
      // invalid
      email: 'testtest.com',
      password: 'password',
    })
    .expect(400)
})

it('responds with an error on invalid pass', () => {
  return request(app)
    .post(API_ROUTE)
    .send({
      email: 'test@test.com',
      // invalid
      password: 'p',
    })
    .expect(400)
})

it('returns 400 with missing email and pass', async () => {
  await request(app)
    .post(API_ROUTE)
    .send({
      email: 'test@test.com',
    })
    .expect(400)

  return request(app)
    .post(API_ROUTE)
    .send({
      password: 'admin',
    })
    .expect(400)
})

it('errors on duplicate email', async () => {
  const user = {
    email: 'test@test.com',
    password: 'test123',
  }

  await request(app).post(API_ROUTE).send(user).expect(201)
  return request(app).post(API_ROUTE).send(user).expect(400)
})

it('sets a cookie on signup', async () => {
  const res = await request(app)
    .post(API_ROUTE)
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)

  // .get allows us to look in to headers on the response
  // with our cookieSession setup we only set cookies when requests
  // come in over https. By default supertest makes a http request.
  // setting the secure property to be dependent on the env in app.ts
  expect(res.get('Set-Cookie')).toBeDefined()
})
