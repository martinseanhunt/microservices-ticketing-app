import express, { Request, Response } from 'express'

import { protectedRoute } from '@mhunt/ticketing-common'

import { Order } from '../models/Order'

const router = express.Router()

router.get(
  '/api/orders',
  protectedRoute,
  async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.currentUser!.id }).populate(
      'ticket'
    )

    return res.status(200).send(orders)
  }
)

export { router as getOrdersRouter }
