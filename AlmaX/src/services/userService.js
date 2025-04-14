import api from '../utils/axiosConfig';

export const getStudents = async () => {
  try {
    const response = await api.get('/users/students');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get students');
  }
};

export const getAlumni = async () => {
  try {
    const response = await api.get('/users/alumni');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get alumni');
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user details');
  }
};