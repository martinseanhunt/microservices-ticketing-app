// This is an abstract class which we're creating to extend the regular JS error. and create our own error classes
// which will all be type checked based on the types we set up here.
// All of our custom errors will then extend this abstract class so we can check against them with instanceOf
// in our error handler to see if we're dealing with a custom error.

export abstract class CustomError extends Error {
  // using the keyword abstract means a subclass MUST implement this (similar to an interface)
  abstract statusCode: number

  constructor(message: string) {
    super(message)

    // When extending a build in JS class with TS we have to do this
    Object.setPrototypeOf(this, CustomError.prototype)
  }

  abstract serializeErrors(): {
    message: string
    field?: string
  }[]
}
