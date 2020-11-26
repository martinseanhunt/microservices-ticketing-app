import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { handleValidationErrors, protectedRoute } from '@mhunt/ticketing-common'

import { Ticket } from '../models/Ticket'
import { natsWrapper } from '../events/natsWrapper'
import { TicketCreatedPublisher } from '../events/publsihers/TicketCreatedPublisher'

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

    // Publish an event to NATS

    // Interesting consideration around data integrity here... What happens if this publish fails.
    // Now we have a DB record for the ticket but other services won't know about it!
    // In a production environment, a solution to this would be, rather than publishing here, to add to an events
    // collection in the DB which would store all events and their status. They would go in with a status of pening
    // then some other function would be responsibel for watching the DB and sending off any unpublished events and
    // marking them as sent. This has the added benefit of being able to use a transaction when adding the ticket, to
    // the tickets colelction and the event to the events collection at the same time. If one fails, they both fail and
    // we can throw / notify the user.

    // For now I'm just letting this run asyncronously rather than awaiting
    const published = new TicketCreatedPublisher(natsWrapper.client).publish({
      // rememebr that mongoose can have pre save hooks so always publish the data from the returned
      // ticket from mongoose rather than using properties from req
      id: ticket.id,
      userId: ticket.userId,
      title: ticket.title,
      price: ticket.price,
    })

    published.then((result) => console.log(result))

    // remember that sending the ticket is going to send what we return from toJSON in the model... Super handy!
    return res.status(201).send(ticket)
  }
)

export { router as createTicketRouter }
