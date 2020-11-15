import { useEffect, useState } from 'react'
import { Button, Box, Text, Link, Image, useColorMode } from '@chakra-ui/react'

import Head from 'next/head'

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode()

  const [user, setUser] = useState()
  const [errors, setErrors] = useState()

  useEffect(() => {
    const get = async () => {
      const res = await (await fetch('/api/users/currentUser')).json()
      setUser(res.currentUser)
    }
    get()
  }, [])

  const signUp = async () => {
    setErrors()
    const res = await (
      await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          ['content-type']: 'application/json',
        },
        body: JSON.stringify({
          email: `${Math.random()}@martin.com`,
          password: 'trees',
        }),
      })
    ).json()
    if (res.errors) return setErrors(res.errors)

    setUser(res)
  }

  return (
    <div>
      <Button onClick={toggleColorMode}>
        Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
      </Button>
      <h1>
        Welcome to <a href="https://nextjs.org">Next.js {user?.email}!</a>
      </h1>

      <Button onClick={signUp}>Sign up</Button>

      {errors && <blockquote>{errors.map((e) => e.message)}</blockquote>}

      <Box p={4} display={{ md: 'flex' }}>
        <Box flexShrink={0}>
          <Image
            borderRadius="lg"
            width={{ md: 40 }}
            src="https://bit.ly/2jYM25F"
            alt="Woman paying for a purchase"
          />
        </Box>
        <Box mt={{ base: 4, md: 0 }} ml={{ md: 6 }}>
          <Text
            fontWeight="bold"
            textTransform="uppercase"
            fontSize="sm"
            letterSpacing="wide"
            color="pink.600"
          >
            Marketing
          </Text>
          <Link
            mt={1}
            display="block"
            fontSize="lg"
            lineHeight="normal"
            fontWeight="semibold"
            href="#"
          >
            Finding customers for your new business
          </Link>
          <Text mt={2} color="gray.500">
            Getting a new business off the ground is a lot of hard work. Here
            are five ideas you can use to find your first customers.
          </Text>
        </Box>
      </Box>
    </div>
  )
}
