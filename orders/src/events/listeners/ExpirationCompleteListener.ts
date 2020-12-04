import { Message } from 'node-nats-streaming'

import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  OrderStatus,
} from '@mhunt/ticketing-common'

import { queueGroupName } from './queueGroupName'
import { Order } from '../../models/Order'

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
  readonly queueGroupName = queueGroupName

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId)

    if (!order) throw new Error('order not found')

    order.set({
      status: OrderStatus.Cancelled,
    })

    await order.save()

    console.log('order marked as cancelled')

    msg.ack()
  }
}
