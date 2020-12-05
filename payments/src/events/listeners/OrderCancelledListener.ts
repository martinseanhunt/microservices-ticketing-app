import { Message } from 'node-nats-streaming'
import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  OrderStatus,
} from '@mhunt/ticketing-common'
import { queueGroupName } from './queueGroupName'

import { Order } from '../../models/Order'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findWithVersion(data)

    // There's no order found with the previous seqential order number so
    // throw an error and don't ack. NATS will retry this until events come
    // through in the right order.

    // I'm not quite understanding why, in some of my services, throwing an error
    // here closes the NATS connection entirely and in others it simply doesn't
    // ack the message... i think it might be safer to just console.log or ocnsole.error here
    // and return early. I'd like to understand why this behaviour is happening though
    if (!order) return console.log('no order found')

    order.set({
      status: OrderStatus.Cancelled,
    })

    await order.save()

    console.log('Order status updated to cancelled')

    msg.ack()
  }
}
