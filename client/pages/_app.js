import { ChakraProvider, extendTheme } from '@chakra-ui/react'
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

function MyApp({ Component, pageProps, currentUser }) {
  return (
    <ChakraProvider theme={customTheme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
