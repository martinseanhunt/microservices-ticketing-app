import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@mhunt/ticketing-common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  // Typescript is able to validate this for us because we've set up the event Type in our Listener abstract class
  // EDIT: Previously were having to annotate the type here so TS know's we're not going to try and change the value of
  // subject later since it's not a const and in the world of js could be reassigned to anything. Instead of annotating
  // we can use TS's readonly keyword which makes the property immutable
  // Before: subject: Subjects.TicketCreated = Subjects.TicketCreated
  readonly subject = Subjects.TicketCreated
}
