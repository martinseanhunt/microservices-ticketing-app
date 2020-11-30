import { Subjects, Publisher, OrderCreatedEvent } from '@mhunt/ticketing-common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
