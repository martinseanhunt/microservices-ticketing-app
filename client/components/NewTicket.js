import { useState, useEffect } from 'react'
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
  useEditable,
} from '@chakra-ui/react'

import { useCurrentUser } from '../contexts/CurrentUser'
import useRequest from '../hooks/useRequest'

export default function NewTicket() {
  const router = useRouter()
  const { currentUser } = useCurrentUser()

  const [formValuesState, setFormValuesState] = useState({
    title: '',
    price: '',
  })

  const { doRequest, isSubmitting, errors } = useRequest({
    url: '/api/tickets',
    method: 'POST',
    body: {
      title: formValuesState.title,
      price: parseFloat(formValuesState.price),
    },
    onSuccess: (data) => {
      console.log(data)
      router.push('/')
    },
  })

  useEffect(() => {
    if (!currentUser) router.push('/signin')
  }, [])

  const onChange = ({ target }) => {
    setFormValuesState((existingValues) => ({
      ...existingValues,
      [target.id]: target.value,
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    await doRequest()
  }

  // TODO: Field level JS validation / sanitisation

  return (
    <>
      <Container p={0} mb={2} mt={9}>
        <Heading as="h1" size="md">
          Create a new ticket for sale
        </Heading>
      </Container>
      <Container border="1px solid" borderRadius="lg" p={30}>
        <form onSubmit={onSubmit}>
          <FormControl id="title" mb={5} isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              type="text"
              value={formValuesState.title}
              onChange={onChange}
            />
            <FormHelperText>A title for your ticket.</FormHelperText>
          </FormControl>

          <FormControl id="price" mb={5} isRequired>
            <FormLabel>Price</FormLabel>
            <Input
              type="text"
              value={formValuesState.price}
              onChange={onChange}
            />
            <FormHelperText>A price for your ticket.</FormHelperText>
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
