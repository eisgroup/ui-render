import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

axiosInstance.interceptors.response.use(response => {
  const { data } = response;
  return data;
}, error => {
  let errorMessage
  const { response: { data = '' } = {} } = error
  const { message: axiosErrorMessage } = error
  if (data && data.message) {
    errorMessage = processErrorMessage(data.message)
  } else {
    errorMessage = axiosErrorMessage || error
  }
  return Promise.reject(errorMessage)
})

export default axiosInstance;

const processErrorMessage = (error) => {
  if (typeof error === 'string' && error.startsWith('Error')) {
    // `match` is null whenever the string starts with 'Error' but carries no `message=…errors` payload.
    // Indexing it directly threw a TypeError inside the rejection handler, replacing the server's message.
    const matched = error.match(/message=(.*)errors/)
    return (matched && matched[1]) || error
  }
  return error;
}