import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

import { RequestValidationError } from '../errors/RequestValidationError'

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Express validator attatches any errors to the req which we pull off here
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new RequestValidationError(errors.array())

  next()
}
