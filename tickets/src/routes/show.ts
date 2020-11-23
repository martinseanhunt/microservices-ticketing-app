import express, { Request, Response } from 'express'

import { Ticket } from '../models/Ticket'
import { NotFoundError } from '@mhunt/ticketing-common'

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const ticket = await Ticket.findById(id)
    if (!ticket) throw new NotFoundError()
    return res.status(200).send(ticket)
  } catch (e) {
    // Will be triggered if someone passes a non-valid ID because
    // mongoose throws an object id error
    throw new NotFoundError()
  }
})

export { router as getTicketRouter }
