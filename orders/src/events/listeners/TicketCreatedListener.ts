import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketCreatedEvent } from '@mhunt/ticketing-common'

import { Ticket } from '../../models/Ticket'
import { queueGroupName } from './queueGroupName'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName = queueGroupName

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { title, price, id } = data

    // Since this is referring to a ticket coming from another service
    // we need a way to make sure that the id's in both services are the
    // same so we know how to reference / update this ticekt on other events etc
    const ticket = Ticket.build({
      id,
      title,
      price,
    })
    await ticket.save()

    console.log('ticket saved to orders db')

    msg.ack()
  }
}
