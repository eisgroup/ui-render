import axiosInstance from '../services/axios'
import { downloadFile } from '../services/downloadFile'

export const updateExperienceData = (experienceData) => axiosInstance
  .post('gdn-rating-rs/UpdateExperienceData', experienceData)

export const downloadHistoricalFileTemplate = (fileName) => axiosInstance
  .get(`gdn-rating-rs/files/${fileName}`, {
    responseType: 'blob'
  })
  .then(downloadFile(fileName))

export const uploadHistoricalFile = (experienceData, file) => axiosInstance
  .post('gdn-rating-rs/experience-data/import', {
    experienceData,
    file
  }, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
