import { Message } from 'node-nats-streaming'

import {
  Listener,
  Subjects,
  PaymentCreatedEvent,
  OrderStatus,
} from '@mhunt/ticketing-common'

import { Order } from '../../models/Order'
import { queueGroupName } from './queueGroupName'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
  queueGroupName = queueGroupName

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId)
    if (!order) return console.log('no order found for payment')

    order.set({
      status: OrderStatus.Complete,
    })
    await order.save()

    console.log('order marked as completed')

    // Again, for the purpose of this application we will never be updating an order
    // after the status has been marked as copleted. That said, in a production app we should be emitting
    // some kind of order updated event here as by making this update we've incremented the version number
    // of the order and other services with copies of orderrs should update thier verison numbers accordingly
    // otherwise future updates to the orders would become problematic.

    msg.ack()
  }
}
