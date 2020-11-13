import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'

import { User } from '../models/User'

import { RequestValidationError } from '../errors/RequestValidationError'
import { BadRequestError } from '../errors/BadRequestError'

const router = express.Router()

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4 })
      .withMessage('Password must be more than 4 chars'),
  ],
  async (req: Request, res: Response) => {
    // Get errors from validation middleware
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array())

    // get properties from body
    const { email, password } = req.body

    // Check if there's already a user and handle
    const existingUser = await User.findOne({ email })
    if (existingUser) throw new BadRequestError('Email is in use')

    // Create and save to mongo
    // Note that we're hashing the password in a pre save hook defined in the User model
    // rather than in this route handler
    const user = User.build({ email, password })
    await user.save()

    // Create and return a cookie containig the JWT.
    // We need to use a cookie because the fron end is SSR and so
    // needs to use a cookie for authentication as the cookie is
    // automatically passed with the requests. Next or any other SSR doesn't have
    // access to the browsers data when rendering server side. It has the cookie though!
    // We can't customise the initial request from the browser before it hits nextJS
    // UNLESS: we use service workers, I don't think using a SW is a good idea but something to
    // be aware of.

    // generate JWT
    const userJWT = jwt.sign(
      {
        email: user.email,
        id: user.id,
      },
      // We're checking this exists when the server starts so we can use ! to suppress
      // the error message from TS
      process.env.JWT_KEY!
    )

    // Store it on the session object
    req.session = {
      jwt: userJWT,
    }

    res.status(201).send(user)
  }
)

export { router as signupRouter }
