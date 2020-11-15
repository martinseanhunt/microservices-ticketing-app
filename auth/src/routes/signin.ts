import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { User } from '../models/User'
import { Password } from '../utils/Password'

import { AuthorizationError } from '../errors/AuthorizationError'
import { handleValidationErrors } from '../middlewares/handleValidationErrors'
import { generateUserJwt } from '../utils/generateUserJwt'

const router = express.Router()

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Please provide a password'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    // get properties off req.body
    const { email, password } = req.body

    // Check if the user with email exists
    const user = await User.findOne({ email })
    if (!user) throw new AuthorizationError('No user with email address')

    // Compare the password
    const correctPassword = await Password.compare(user.password, password)
    if (!correctPassword) throw new AuthorizationError('Wrong password')

    // Generate a JWT and store it on the session object
    req.session = { jwt: generateUserJwt(user) }

    // Return the processed user object
    return res.status(200).send(user)
  }
)

export { router as signinRouter }
