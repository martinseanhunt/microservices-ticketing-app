import AuthForm from '../components/AuthForm'

export default function SignUp() {
  return <AuthForm apiUrl={'/api/users/signup'} />
}
