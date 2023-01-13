import axiosInstance from '../services/axios'

const baseURL = process.env.REACT_APP_API_URL || '/'

export const updateExperienceData = (experienceData) => axiosInstance
  .post('gdn-rating-rs/UpdateExperienceData', experienceData)

export const downloadHistoricalFileTemplate = (fileName) => fetch(`${baseURL}gdn-rating-rs/files/${fileName}`)

export const uploadHistoricalFile = (experienceData, file) => axiosInstance
  .post('gdn-rating-rs/experience-data/import', {
    experienceData,
    file
  }, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
