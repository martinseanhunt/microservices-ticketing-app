import { Request, Response, NextFunction } from 'express'

import { AuthorizationError } from '../errors/AuthorizationError'

export const protectedRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If we haven't set the currentUser on the request object from the currentUser
  // middleware then we're not logged in so deny access!
  if (!req.currentUser)
    throw new AuthorizationError('Access Denied: Please login')

  // otherwise you're good to go :)
  next()
}
