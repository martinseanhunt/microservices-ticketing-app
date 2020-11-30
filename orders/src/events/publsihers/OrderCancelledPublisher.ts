import {
  Subjects,
  Publisher,
  OrderCancelledEvent,
} from '@mhunt/ticketing-common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
