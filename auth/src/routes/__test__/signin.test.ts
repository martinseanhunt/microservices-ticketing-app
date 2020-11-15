import request from 'supertest'
import { app } from '../../app'

const API_ROUTE = '/api/users/signin'

const validUser = {
  email: 'test@test.com',
  password: '1234',
}

// Not sure if this is good TS, having a go ;)
const signUpUser = async (user: {
  email: string
  password: string
}): Promise<request.Response> =>
  await request(app).post('/api/users/signup').send(user).expect(201)

// TODO: request validation tests

it('responds 400 when no user exists', () => {
  return request(app)
    .post(API_ROUTE)
    .send({
      email: 'test@tst.com',
      password: '123',
    })
    .expect(401)
})

it('fails when incorrect pass is supplied', async () => {
  // sign up the user
  await signUpUser(validUser)

  return request(app)
    .post(API_ROUTE)
    .send({
      ...validUser,
      password: '12345',
    })
    .expect(401)
})

it('allows a signed up user to sign in adn respons with cookie', async () => {
  const res = await signUpUser(validUser)
  expect(res.get('Set-Cookie')).toBeDefined()
})
