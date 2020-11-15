import request from 'supertest'
import { app } from '../../app'

const API_ROUTE = '/api/users/signout'

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

it('clears the cookie after signing out', async () => {
  await signUpUser(validUser)

  const res = await request(app).post(API_ROUTE).send({}).expect(200)

  // this is a quick solution. Should really check that the cookie expires in the past
  expect(res.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  )
})
