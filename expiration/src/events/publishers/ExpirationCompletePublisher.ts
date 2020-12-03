import { Publisher, Subjects, ExpirationCompleteEvent } from '@mhunt/ticketing-common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}