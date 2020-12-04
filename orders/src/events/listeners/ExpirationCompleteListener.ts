import { Message } from 'node-nats-streaming'

import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  OrderStatus,
} from '@mhunt/ticketing-common'

import { queueGroupName } from './queueGroupName'
import { Order } from '../../models/Order'
import { OrderCancelledPublisher } from '../publsihers/OrderCancelledPublisher'

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
  readonly queueGroupName = queueGroupName

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket')

    if (!order) throw new Error('order not found')

    // We don't ever want to change the status of a complete order to cancelled
    // the expiration service ALWAYS sendss an expiration message as it has no
    // concept of whether someone has completed a ticket in the time it's wating
    // to send the messagfe absed on an orders expiresAt prop
    if (order.status === OrderStatus.Complete) return msg.ack()

    order.set({
      status: OrderStatus.Cancelled,
    })

    await order.save()

    console.log('order marked as cancelled')

    const res = await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      userId: order.userId,
      ticket: {
        id: order.ticket.id,
      },
      status: order.status,
    })
    console.log(res)

    msg.ack()
  }
}
