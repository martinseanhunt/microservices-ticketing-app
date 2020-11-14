import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { User } from '../models/User'

import { BadRequestError } from '../errors/BadRequestError'
import { handleValidationErrors } from '../middlewares/handleValidationErrors'

import { generateUserJwt } from '../utils/generateUserJwt'

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
  handleValidationErrors,
  async (req: Request, res: Response) => {
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

    // Generate a JWT and store it on the session object
    req.session = {
      jwt: generateUserJwt(user),
    }

    // Send back a version of the user object which is formatted to our spec
    // We're doing this by adding the toJSON property on to the object within
    // our user model which modifies how JSON.stringify processes the object
    res.status(201).send(user)
  }
)

export { router as signupRouter }
