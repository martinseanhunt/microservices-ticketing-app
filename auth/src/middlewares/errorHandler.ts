import { Request, Response, NextFunction } from 'express'

import { CustomError } from '../errors/CustomError'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err)

  if (err instanceof CustomError)
    return res.status(err.statusCode).send({ errors: err.serializeErrors() })

  return res.status(500).send({
    errors: [{ message: err.message || 'Something went wrong' }],
  })
}
