import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketUpdatedEvent } from '@mhunt/ticketing-common'

import { Ticket } from '../../models/Ticket'
import { queueGroupName } from './queueGroupName'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
  queueGroupName = queueGroupName

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { title, price, id, version } = data

    // Since this is referring to a ticket coming from another service
    // we need a way to make sure that the id's in both services are the
    // same so we know how to reference / update this ticekt on other events etc

    // finding a ticket where the version is the version of ticket
    // coming via the event - 1 to handle concurrency. If events
    // hit our service out of order they will fail and will be retried
    // unitl the correct order is processed
    const ticket = await Ticket.findOne({
      _id: id,
      version: version - 1,
    })

    console.log(ticket)

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
