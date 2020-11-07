import { CustomError } from './CustomError'

export class DatabaseConnectionError extends CustomError {
  reason = 'Error connecting to database'
  statusCode = 500

  constructor() {
    // this message just gets logged, not sent to the user
    super('Error connecting to DB')

    // When extending a build in JS class with TS we have to do this
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
  }

  serializeErrors() {
    return [{ message: this.reason }]
  }
}
