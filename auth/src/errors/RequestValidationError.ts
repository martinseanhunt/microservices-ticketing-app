import { ValidationError } from 'express-validator'

import { CustomError } from './CustomError'

export class RequestValidationError extends CustomError {
  // Give our class a property of errors which is an array of ValidationErrors from express validator
  // doing private errors: ValidationError[] in the constructor argument list is shorthand for doing:

  /* 
    private errors: ValidationError[]

    constructor(errors: ValidationError[]) {
      this.errors = errors
    }
  */

  statusCode = 400

  constructor(private errors: ValidationError[]) {
    // this message just gets logged, not sent to the user
    super('Validation failed!')

    // When extending a build in JS class with TS we have to do this
    Object.setPrototypeOf(this, RequestValidationError.prototype)
  }

  serializeErrors() {
    return this.errors.map((e) => ({
      message: e.msg,
      field: e.param,
    }))
  }
}
