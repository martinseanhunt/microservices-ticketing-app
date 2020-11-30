import express, { Request, Response } from 'express'
import { param } from 'express-validator'

import {
  protectedRoute,
  handleValidationErrors,
  NotFoundError,
  OrderStatus,
} from '@mhunt/ticketing-common'

import { Order } from '../models/Order'
import { OrderCancelledPublisher } from '../events/publsihers/OrderCancelledPublisher'
import { natsWrapper } from '../events/natsWrapper'

const router = express.Router()

// This should probably be a patch rather than a delete
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

    // Publish an event to say this order has been cancelled
    const pub = await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      userId: order.userId,
      status: order.status,
      ticket: {
        id: order.ticket.id,
      },
    })

    console.log(pub)

    return res.status(200).send(order)
  }
)

export { router as deleteOrderRouter }
