import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { stripe } from '../lib/stripe'
import { Payment } from '../models/Payment'
import { PaymentCreatedPublisher } from '../events/publsihers/PaymentCreatedPublisher'

import {
  protectedRoute,
  handleValidationErrors,
  BadRequestError,
  AuthorizationError,
  NotFoundError,
  OrderStatus,
} from '@mhunt/ticketing-common'

import { Order } from '../models/Order'
import { natsWrapper } from '../events/natsWrapper'

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
    const charge = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'gbp',
      source: token,
    })

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    })

    await payment.save()

    // publsih event letting other servies know the payment was taken successfully
    const publishRes = await new PaymentCreatedPublisher(
      natsWrapper.client
    ).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    })
    console.log(publishRes)

    res.status(201).send(payment)
  }
)

export { router as createChargeRouter }
