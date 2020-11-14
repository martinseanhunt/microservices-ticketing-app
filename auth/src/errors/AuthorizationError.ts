import { CustomError } from './CustomError'

export class AuthorizationError extends CustomError {
  statusCode = 401

  constructor(private errorMessage: string) {
    // this is being forwarded to the base error class so we can log the error to console etc.
    super(errorMessage)

    // When extending a build in JS class with TS we have to do this
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }

  serializeErrors() {
    return [{ message: this.errorMessage }]
  }
}
