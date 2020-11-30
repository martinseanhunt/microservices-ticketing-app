import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketUpdatedEvent } from '@mhunt/ticketing-common'

import { Ticket } from '../../models/Ticket'
import { queueGroupName } from './queueGroupName'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
  queueGroupName = queueGroupName

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { title, price, id } = data

    // Since this is referring to a ticket coming from another service
    // we need a way to make sure that the id's in both services are the
    // same so we know how to reference / update this ticekt on other events etc
    const ticket = await Ticket.findById(id)

    // TODO handle this case better
    if (!ticket) throw new Error('ticket not found')

    ticket.set({
      title,
      price,
    })
    await ticket.save()

    msg.ack()
  }
}
