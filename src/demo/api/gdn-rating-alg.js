import axiosInstance from '../services/axios'

const baseURL = process.env.REACT_APP_API_URL || '/'

export const updatePerformanceData = (ratingData) => axiosInstance
  .post('gdn-rating-rs/UpdatePerformanceData', ratingData)

export const downloadHistoricalFileTemplate = (fileName) => fetch(`${baseURL}gdn-rating-rs/files/${fileName}`)

export const uploadHistoricalFile = (ratingData, file) => axiosInstance
  .post('gdn-rating-rs/rating-data/import', {
    ratingData,
    file
  }, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
