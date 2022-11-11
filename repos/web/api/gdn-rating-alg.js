import axiosInstance from '../services/axios'

export const updateExperienceData = (data) => axiosInstance.post('gdn-rating-rs/UpdateExperienceData', data)
