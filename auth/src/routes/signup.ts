import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'

import { RequestValidationError } from '../errors/RequestValidationError'
import { DatabaseConnectionError } from '../errors/DatabaseConnectionError'

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
  (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array())
    }

    const { email, password } = req.body

    console.log('creating user' + email + password)

    throw new DatabaseConnectionError()

    return res.send('signup success')
  }
)

export { router as signupRouter }
