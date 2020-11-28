import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import {
  protectedRoute,
  handleValidationErrors,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from '@mhunt/ticketing-common'

import { Ticket } from '../models/Ticket'
import { Order } from '../models/Order'
import e from 'express'

const router = express.Router()

// Should probably put this in an env variable
// or in the database as an admin configurable setting
const EXPIRATION_WINDOW_SECONDS = 15 * 60

router.post(
  '/api/orders',
  protectedRoute,
  // be aware that introduces a very subtle coupling between services becuase we're
  // expecting that all services use mongodb.
  [body('ticketId').isMongoId().withMessage('please provide a ticket i')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body

    // Find the ticket the user is trying to order in our DB
    const ticket = await Ticket.findById(ticketId)

    // If there's no ticket found return an error
    if (!ticket) throw new NotFoundError()

    // Find out whether the ticket is already reserved usign a helper method we created
    // on the ticket doc in mongoose
    const isTicketAlreadyReserved = ticket.isReserved()
    if (isTicketAlreadyReserved)
      throw new BadRequestError('Ticket is no longer available')

    // calculate an expiration date for the order - user must purchase in this window
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // build the order and save it to the database
    const order = Order.build({
      ticket: ticket,
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      exiresAt: expiration,
    })
    await order.save()

    // Publish an event saying that an orer was created.
    // TODO

    res.status(201).send(order)
  }
)

export { router as createOrderRouter }
