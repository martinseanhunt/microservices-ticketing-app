import { ChakraProvider, extendTheme, Container } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const config = {
  useSystemColorMode: false,
  initialColorMode: 'dark',
}

const customTheme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: mode('pink.50', 'pink.900')(props),
      },
    }),
  },
  config,
})

console.log(customTheme)

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={customTheme}>
      <Container maxW="lg">
        <Component {...pageProps} />
      </Container>
    </ChakraProvider>
  )
}

export default MyApp
