import {
  Publisher,
  PaymentCreatedEvent,
  Subjects,
} from '@mhunt/ticketing-common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
