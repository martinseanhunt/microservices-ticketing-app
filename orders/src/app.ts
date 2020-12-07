import express from 'express'
// This package makes throwing errors in async routes work without having to call next when throwing the error.
// See https://expressjs.com/en/guide/error-handling.html and https://www.npmjs.com/package/express-async-errors
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

import { getOrdersRouter } from './routes/index'
import { getOrderRouter } from './routes/show'
import { createOrderRouter } from './routes/new'
import { deleteOrderRouter } from './routes/delete'

import {
  NotFoundError,
  errorHandler,
  currentUser,
} from '@mhunt/ticketing-common'

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
    // Don't encrpt the cookie - as the JWT is protected
    signed: false,
    // Only send cookies over https
    // unless we're in a test env
    // secure: process.env.NODE_ENV !== 'test',
    // allowing unsecure for now while we set up the live deploy
    secure: false,
  })
)

// Current user middleware attatches user JWT info to req
app.use(currentUser)

// Routes
app.use(getOrdersRouter)
app.use(getOrderRouter)
app.use(createOrderRouter)
app.use(deleteOrderRouter)

// Catch all route handler and 404
app.all('*', () => {
  throw new NotFoundError()
})

// Error handler
app.use(errorHandler)

export { app }
