import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'

import { app } from '../app'

declare global {
  namespace NodeJS {
    interface Global {
      signIn: (user?: { email: string; password: string }) => Promise<string[]>
    }
  }
}

// This file is hooked up in package JSON and is run after the jest env is set up
// and before tests

let mongo: any

beforeAll(async () => {
  // Set the environbment variables... There are better ways of
  // doing this!
  process.env.JWT_KEY = 'adiojwj'

  // start up an in memory version of mongo and have our app connect to it
  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

beforeEach(async () => {
  // clean the database

  // get all collections that exist in the db
  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    // Delete all docs within a collection ?
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  // stop the instance and close connection
  await mongo.stop()
  await mongoose.connection.close()
})

// globally scoped helper function.. I don't think this is a good idea!
// but fine for the purpose of this non-testing focused course
global.signIn = async (user) => {
  const validUser = {
    email: 'test@test.com',
    password: '1234',
  }

  const res = await request(app)
    .post('/api/users/signup')
    .send(user || validUser)
    .expect(201)

  const cookie = res.get('Set-Cookie')

  return cookie
}
