import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import jwt from 'jsonwebtoken'

// mocking the natsWrapper so we don't connect to the live nats server
// grabs the mock implemetnation for __mocks__ in the same dir as the import
// we're mocking. It's used so commonly that I'm mocking it here for all the test suites
jest.mock('../events/natsWrapper')

import { app } from '../app'

declare global {
  namespace NodeJS {
    interface Global {
      signIn: (user?: { email: string; id: string }) => string
    }
  }
}

// This file is hooked up in package JSON and is run after the jest env is set up
// and before tests

let mongo: any

beforeAll(async () => {
  // Set the environbment variables for our app when we're running tests...
  // There are better ways of doing this but this is quick!
  process.env.JWT_KEY = 'segsegsegs'

  // start up an in memory version of mongo and have our app connect to it
  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  console.log('here')

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

  // clear mock implemtnations
  jest.clearAllMocks()
})

afterAll(async (done) => {
  // stop the instance and close connection
  await mongo.stop()

  // This is acting a bit funny sometimes - TODO: debug
  await mongoose.connection.close()
  done()
})

// globally scoped helper function.. I don't think this is a good idea!
// but fine for the purpose of this non-testing focused course. We should import,
// or have jest import it for us.
global.signIn = (user) => {
  const validUser = {
    email: 'test@test.com',
    id: '1234',
  }

  // ! on the jwt key iis fine to use I think as it's explicityl defined above.
  const token = jwt.sign(user || validUser, process.env.JWT_KEY!)
  const cookie = Buffer.from(JSON.stringify({ jwt: token })).toString('base64')

  return `express:sess=${cookie}`
}
