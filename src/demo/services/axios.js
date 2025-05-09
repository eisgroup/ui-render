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
    return error.match(/message\=(.*)errors/)[1] || error
  }
  return error;
}