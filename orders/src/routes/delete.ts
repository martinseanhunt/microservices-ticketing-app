import express, { Request, Response } from 'express'
import { param } from 'express-validator'

import {
  protectedRoute,
  handleValidationErrors,
  NotFoundError,
  OrderStatus,
} from '@mhunt/ticketing-common'

import { Order } from '../models/Order'

const router = express.Router()

router.delete(
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

    order.set({
      status: OrderStatus.Cancelled,
    })

    await order.save()

    await res.status(200).send(order)
  }
)

export { router as deleteOrderRouter }
