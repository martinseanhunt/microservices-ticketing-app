import express from 'express'
// This package makes throwing errors in async routes work without having to call next when throwing the error.
// See https://expressjs.com/en/guide/error-handling.html and https://www.npmjs.com/package/express-async-errors
import 'express-async-errors'
import { json } from 'body-parser'

import { currentUserRouter } from './routes/currentuser'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'
import { errorHandler } from './middlewares/errorHandler'

import { NotFoundError } from './errors/NotFoundError'

const app = express()
app.use(json())

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

app.listen(3000, () => console.log('Auth service listening on 3000!!'))
