import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { handleValidationErrors, protectedRoute } from '@mhunt/ticketing-common'

const router = express.Router()

router.post(
  '/api/tickets',
  protectedRoute,
  [
    body('title')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Must provide a title'),
    body('price')
      .isFloat({ gt: 0 })
      .notEmpty()
      .withMessage('Must provide a price as a positive float'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    return res.status(200).send('ok')
  }
)

export { router as createTicketRouter }
