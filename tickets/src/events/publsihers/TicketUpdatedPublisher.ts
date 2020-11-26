import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@mhunt/ticketing-common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
