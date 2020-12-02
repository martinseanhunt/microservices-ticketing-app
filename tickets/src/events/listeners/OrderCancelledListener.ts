import { Message } from 'node-nats-streaming'

import {
  Listener,
  OrderCancelledEvent,
  Subjects,
} from '@mhunt/ticketing-common'

import { TicketUpdatedPublisher } from '../publsihers/TicketUpdatedPublisher'
import { queueGroupName } from './queueGroupName'
import { Ticket } from '../../models/Ticket'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  readonly queueGroupName = queueGroupName

  onMessage = async (data: OrderCancelledEvent['data'], msg: Message) => {
    // Get the ticket that is associated with the cancelled order
    const ticket = await Ticket.findById(data.ticket.id)

    // throw if not found
    if (!ticket) throw new Error('ticket not found')

    // Update the order ID to null signalling the ticket is available for purchase again
    ticket.set({
      orderId: undefined,
    })

    await ticket.save()

    // send a ticket updated event to keep version numbers in sync with other documents
    // again should probably be sending individual props here... just saving some time
    const res = await new TicketUpdatedPublisher(this.client).publish(ticket)
    console.log(res)

    msg.ack()
  }
}
