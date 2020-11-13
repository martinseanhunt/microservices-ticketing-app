import { CustomError } from './CustomError'

export class BadRequestError extends CustomError {
  statusCode = 400

  constructor(private customMessage: string) {
    // this message just gets logged, not sent to the user
    super(`Bad request: ${customMessage}`)

    // When extending a build in JS class with TS we have to do this
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }

  serializeErrors() {
    return [{ message: this.customMessage }]
  }
}
