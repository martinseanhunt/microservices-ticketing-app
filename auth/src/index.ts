import express from 'express'
// This package makes throwing errors in async routes work without having to call next when throwing the error.
// See https://expressjs.com/en/guide/error-handling.html and https://www.npmjs.com/package/express-async-errors
import 'express-async-errors'
import { json } from 'body-parser'
import mongoose from 'mongoose'
import cookieSession from 'cookie-session'

import { currentUser } from './middlewares/currentUser'
import { currentUserRouter } from './routes/currentuser'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'
import { errorHandler } from './middlewares/errorHandler'

import { NotFoundError } from './errors/NotFoundError'

// Init Express
const app = express()

// This is because we're only serving cookies over https
// and traffic is being proxied to express via ingress nginx
// we're telling it to trust traffic as secure even when coming from a proxy
app.set('trust proxy', true)

// Parse body
app.use(json())

// Set up cookies
app.use(
  cookieSession({
    // Don't encrpt
    signed: false,
    // Only send cookies over https
    secure: true,
  })
)

// Current user middleware attatches user JWT info to req
app.use(currentUser)

// Routes
app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

// Catch all route handler and 404
app.all('*', () => {
  throw new NotFoundError()
})

// Error handler
app.use(errorHandler)

// Connect to database and start server
const connectAndStart = async () => {
  // check that our env variables are all set up

  // We have to cehck this exists because TS doesn't let us assume it is set
  // it does this by giving env vars a type of string | undefined so we can't
  // reference it unless it's been checked
  if (!process.env.JWT_KEY) throw new Error('Environment var jwt key not found')

  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('Connected to mongo db')
  } catch (e) {
    console.error(e)
  }

  // Start server
  app.listen(3000, () => console.log('Auth service listening on 3000!'))
}

connectAndStart()
