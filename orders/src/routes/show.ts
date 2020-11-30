import express, { Request, Response } from 'express'
import { param } from 'express-validator'

import {
  handleValidationErrors,
  NotFoundError,
  protectedRoute,
} from '@mhunt/ticketing-common'

import { Order } from '../models/Order'

const router = express.Router()

router.get(
  '/api/orders/:id',
  protectedRoute,
  [param('id').isMongoId()],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params

    const order = await Order.findById(id)
      .where({ userId: req.currentUser!.id })
      .populate('ticket')
    if (!order) throw new NotFoundError()

    return res.send(order)
  }
)

export { router as getOrderRouter }
