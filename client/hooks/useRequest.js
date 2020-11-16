import { useState } from 'react'
import axios from 'axios'

export default function useRequest({
  url,
  method,
  body = {},
  onSuccess = () => null,
}) {
  const [errors, setErrors] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const doRequest = async () => {
    setErrors()
    setIsSubmitting(true)
    try {
      const res = await axios[method.toLowerCase()](url, body)
      onSuccess(res.data)
    } catch (e) {
      setErrors(e.response.data.errors)
    }
    setIsSubmitting(false)
  }

  return {
    doRequest,
    errors,
    isSubmitting,
  }
}
