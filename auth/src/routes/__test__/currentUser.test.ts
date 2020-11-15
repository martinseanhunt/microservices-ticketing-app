import request from 'supertest'
import { app } from '../../app'

const API_ROUTE = '/api/users/currentuser'

const validUser = {
  email: 'tesst@test.com',
  password: '1234',
}

it('respponds with the current user', async () => {
  // settign a global signin function that returns the cookie
  // in setup.ts
  const cookie = await global.signIn(validUser)

  const res = await request(app)
    .get(API_ROUTE)
    .set('Cookie', cookie)
    .send()
    .expect(200)

  expect(res.body.currentUser.email).toEqual(validUser.email)
})

it('respponds with currentUser null when no cookie', async () => {
  // settign a global signin function that returns the cookie
  // in setup.ts
  const res = await request(app).get(API_ROUTE).send().expect(200)

  expect(res.body.currentUser).toBeNull()
})
