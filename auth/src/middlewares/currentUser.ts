import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface UserPayload {
  id: string
  email: string
}

// Setting up an optional property of currentUser on expresses
// Request type
declare global {
  // inside of the express namespace
  namespace Express {
    // find the request type
    interface Request {
      // and add an optional property to it
      currentUser?: UserPayload
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if the request has a cookie with the JWT
  // If not, there's no user so forward to the next middleware / route
  // !req.session?.jwt is equivilent to (!req.session || !req.session?.jwt)
  if (!req.session?.jwt) return next()

  try {
    // Check if the token is valid
    // verify returns type string | object. Lets give it a more precice defenition
    // by telling ts to store the value as a UserPayload
    const decodedJWT = jwt.verify(
      req.session.jwt,
      // We're checking this exists when the server starts so we can use ! to suppress
      // the error message from TS
      process.env.JWT_KEY!
    ) as UserPayload

    // If it is, put the users info on the request
    // TS won't let us just do req.currentUser because the request type doesnt have
    // a currentUser property.
    req.currentUser = decodedJWT
  } catch (e) {
    // The token was invalid
  }

  next()
}
