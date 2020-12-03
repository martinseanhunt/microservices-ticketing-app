import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@mhunt/ticketing-common'

import { queueGroupName } from './queueGroupName'
import { expirationQueue } from '../../queues/expirationQueue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // calculate the difference between now and the expiresAt property
    // so we know how long to delay the processing of the job
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime()

    // Adding a job to the bull queue when we receive an order created event
    expirationQueue.add(
      // The payload with the order ID that we want to expire after a certina
      // amount of time.
      { orderId: data.id },
      // options object
      {
        // tells bull to delay attempting to send the job to our processing
        // function
        delay,
      }
    )

    console.log(
      `Job added to the queue, order ${data.id} will expire in ${
        delay / 1000 / 60
      } mins`
    )

    // acknowledge the successful processing of the NATS event
    msg.ack()
  }
}
