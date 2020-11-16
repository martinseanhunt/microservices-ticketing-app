import { signup } from '../lib/api'
import AuthForm from '../components/AuthForm'

export default function SignUp() {
  return <AuthForm apiMethod={signup} />
}
