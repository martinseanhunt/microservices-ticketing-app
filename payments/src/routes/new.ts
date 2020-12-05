import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import {
  protectedRoute,
  handleValidationErrors,
  BadRequestError,
  AuthorizationError,
  NotFoundError,
  OrderStatus,
} from '@mhunt/ticketing-common'

import { Order } from '../models/Order'

const router = express.Router()

// creating a new charge for the order.
router.post(
  '/api/payments',
  protectedRoute,
  [body('token').not().isEmpty(), body('orderId').isMongoId()],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)
    if (!order) throw new NotFoundError()

    // if the order doesn't belong to the signed in usr, throw.
    if (order.userId !== req.currentUser!.id)
      throw new AuthorizationError('access denied')

    // if the order is already cancelled / expired throw
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError('order is no longer valid')

    // now we can charge the user

    res.send({ success: true })
  }
)

export { router as createChargeRouter }
