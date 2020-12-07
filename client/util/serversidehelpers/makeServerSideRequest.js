import axios from 'axios'

export default async function makeServerSideRequest(
  apiPath,
  req,
  options = {}
) {
  // we need to request to ingress-nginx because if we just do /api/* then it will be makign
  // the request within the running container for this sevice.

  // http://NAMEOFSERVICE.NAMESPACE.svc.custer.local
  // is the pattern for reaching out across namespaces within a kubernetes cluster

  // find the namespace with k get namespace then find the service within that by doing
  // k get services -n somenamespacename

  // TODO get this from env file
  const baseUrl =
    'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'

  let res = null

  try {
    res = await axios.get(`${baseUrl}${apiPath}`, {
      /*
        I've switched to just forwarding all the headers but leaving this here as it better explains why! 
        // becuase we're set up to handle domain access for ticketing.dev in our ingress yaml file
        // ingress doesn't know where to forward the request unless we explixitly tell it the domain
        // we're looking for.
        
        headers: {
          Host: req.headers.host, // this will be ticketing.dev
          // Passing our browsers cookie along with the request
          Cookie: req.headers.cookie,
        }
      */
      headers: req.headers,
      ...options,
    })
  } catch (e) {
    console.error(e.message)
  }

  return res
}
