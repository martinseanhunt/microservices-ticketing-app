import axios from 'axios'

const USERS_API = '/api/users'

// TODO: Think about how we want to handle displaying errors in a reusable way

export const getCurrentUser = async () => {
  try {
    const res = await axios.get(USERS_API + '/currentuser', {})
    return res.data
  } catch (e) {
    console.log(e)
  }

  return
}

export const signout = async () => {
  try {
    const res = await axios.post(USERS_API + '/signout', {})
    return res.data
  } catch (e) {
    console.error(e.response.data)
  }

  return
}

export const signup = async (email, password) => {
  try {
    const res = await axios.post(USERS_API + '/signup', {
      email,
      password,
    })

    return res.data
  } catch (e) {
    return e.response.data
  }

  return
}

export const signin = async (email, password) => {
  try {
    const res = await axios.post(USERS_API + '/signin', {
      email,
      password,
    })

    return res.data
  } catch (e) {
    return e.response.data
  }

  return
}
