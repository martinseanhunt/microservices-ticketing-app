import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@mhunt/ticketing-common'
import { queueGroupName } from './queueGroupName'

import { Order } from '../../models/Order'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      userId: data.userId,
      status: data.status,
      version: data.version,
    })

    await order.save()

    console.log('Order saved')

    msg.ack()
  }
}
