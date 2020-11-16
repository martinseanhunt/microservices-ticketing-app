import { useState } from 'react'
import { useRouter } from 'next/router'

import {
  Button,
  Heading,
  Box,
  Container,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

import { signup } from '../lib/api'
import { useCurrentUser } from '../contexts/CurrentUser'

export default function SignUp() {
  const router = useRouter()
  const { setCurrentUser } = useCurrentUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValuesState, setFormValuesState] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState()

  const onSignup = async () => {
    setErrors()
    setIsSubmitting(true)

    const { email, password } = formValuesState
    const res = await signup(email, password)
    setIsSubmitting(false)

    if (res.errors) return setErrors(res.errors)

    setCurrentUser(res)
    router.push('/')
  }

  const onChange = ({ target }) => {
    setFormValuesState((existingValues) => ({
      ...existingValues,
      [target.id]: target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    onSignup()
  }

  // TODO: Field level JS validation

  return (
    <>
      <Container p={0} mb={2} mt={9}>
        <Heading as="h1" size="md">
          Join us! You know you want to
        </Heading>
      </Container>
      <Container border="1px solid" borderRadius="lg" p={30}>
        <form onSubmit={onSubmit}>
          <FormControl id="email" mb={5} isRequired>
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              value={formValuesState.email}
              onChange={onChange}
            />
            <FormHelperText>We'll never share your email.</FormHelperText>
          </FormControl>

          <FormControl id="password" mb={5} isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={formValuesState.password}
              onChange={onChange}
            />
            <FormHelperText>Make it strong!</FormHelperText>
          </FormControl>

          {errors?.map((e) => (
            <Alert status="error" mb={5} key={e.message}>
              <AlertIcon />
              <AlertTitle mr={2} textTransform="capitalize">
                {e.field} error!
              </AlertTitle>
              <AlertDescription>{e.message}</AlertDescription>
            </Alert>
          ))}

          <Box textAlign="right">
            <Button colorScheme="pink" isLoading={isSubmitting} type="submit">
              Submit
            </Button>
          </Box>
        </form>
      </Container>
    </>
  )
}
