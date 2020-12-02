import express, { Request, Response } from 'express'
import { param, body } from 'express-validator'

import {
  protectedRoute,
  NotFoundError,
  handleValidationErrors,
  AuthorizationError,
  BadRequestError,
} from '@mhunt/ticketing-common'

import { Ticket } from '../models/Ticket'
import { TicketUpdatedPublisher } from '../events/publsihers/TicketUpdatedPublisher'
import { natsWrapper } from '../events/natsWrapper'

const router = express.Router()

router.put(
  '/api/tickets/:id',
  protectedRoute,
  [
    param('id').isMongoId(),
    body('title').isString().notEmpty(),
    body('price').isNumeric().notEmpty(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { title, price } = req.body

    // shouldn't need to try catch this like we did in the
    // other router because I found an isMongoId validator
    // in express-validator!
    const ticket = await Ticket.findById(id)

    if (!ticket) throw new NotFoundError()
    if (ticket.userId !== req.currentUser?.id)
      throw new AuthorizationError('Not your ticket! GETTTOUUUTAHERE')

    // if there's an order ID then there is an associated order with this
    // ticket so it is RESERVED and can't be edited unless the order is cancelled
    if (ticket.orderId) throw new BadRequestError('Tickt is reserved')

    ticket.set({
      price,
      title,
    })

    await ticket.save()

    const updated = new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      userId: ticket.userId,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
    })

    updated.then((result) => console.log(result))

    return res.status(200).send(ticket)
  }
)

export { router as updateTicketRouter }
