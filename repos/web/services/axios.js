import axios from 'axios'
import { popupAlert } from 'ui-modules-pack/popup'

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
    errorMessage = data.message
  } else {
    errorMessage = axiosErrorMessage || error
  }
  popupAlert('Error', errorMessage)
  return Promise.reject(errorMessage)
})

export default axiosInstance;