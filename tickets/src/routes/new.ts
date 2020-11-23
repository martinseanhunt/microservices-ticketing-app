import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { handleValidationErrors, protectedRoute } from '@mhunt/ticketing-common'
import { Ticket } from '../models/Ticket'

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
    const { title, price } = req.body

    // We can ignore TS complaining about currentUser possibly being undefined
    // because we're using the protectedRoute middleware which won't let a request through
    // unless it is!
    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id })
    await ticket.save()

    // remember that sending the ticket is going to send what we return from toJSON in the model... Super handy!
    return res.status(201).send(ticket)
  }
)

export { router as createTicketRouter }
