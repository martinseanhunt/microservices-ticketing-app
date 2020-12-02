import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@mhunt/ticketing-common'

import { TicketUpdatedPublisher } from '../publsihers/TicketUpdatedPublisher'
import { queueGroupName } from './queueGroupName'
import { Ticket } from '../../models/Ticket'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  readonly queueGroupName = queueGroupName

  onMessage = async (data: OrderCreatedEvent['data'], msg: Message) => {
    const { id, ticket: orderTicket } = data

    // Find the associated ticket
    const ticket = await Ticket.findById(orderTicket.id)

    // Don't ack if no ticket
    if (!ticket) throw new Error('No ticket found for incoming order')

    // Save the orderID of the incoming orderID
    ticket.set({ orderId: id })
    await ticket.save()

    // We're using the presence of an orderID to indicate that there's
    // an order in process for this ticked and the ticket is locked.
    console.log('Order succesfully associated with ticket')

    // Now we want to publish a ticket updated event so that other services
    // are aware of the version number change
    const publisher = new TicketUpdatedPublisher(this.client)

    // Better to just send individual properties
    // rather than the whole ticket object... just saving time here
    // since this is a study project.
    const res = await publisher.publish(ticket)
    console.log(res)

    msg.ack()
  }
}
