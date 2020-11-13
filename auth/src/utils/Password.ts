import { scrypt as scryptWithCallbacks, randomBytes } from 'crypto'
import { promisify } from 'util'

// Turn callback based scrypt in to promisified version so we can use async / await etc
const scrypt = promisify(scryptWithCallbacks)

export class Password {
  // Static methods are available directly on the class rather than an instance of the class
  // can be called with Password.toHash() rather than pass = new Password(); pass.toHash()
  static async toHash(password: string) {
    // Generate a random string to use as the salt
    const salt = randomBytes(8).toString('hex')

    // Remind TS that what we're getting back from our promisified version of
    // scrypt is a buffer and save the buffer to a variable
    const buf = (await scrypt(password, salt, 64)) as Buffer

    // return the hash by turning the buffer in to a string and append the salt
    return `${buf.toString('hex')}.${salt}`
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    // Get the hashed password and salt off of the stored password
    const [hashedPassword, salt] = storedPassword.split('.')

    // hash the supplied password and see if it matches what we've just gotten from the DB
    const buf = (await scrypt(suppliedPassword, salt, 64)) as Buffer
    return buf.toString('hex') === hashedPassword
  }
}
