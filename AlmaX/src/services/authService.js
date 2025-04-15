import api from '../utils/axiosConfig';

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);

    // If response contains access token, store it
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });

    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/users/logout');
    // Clear token from localStorage
    localStorage.removeItem('accessToken');
  } catch (error) {
    localStorage.removeItem('accessToken');
    throw new Error(error.response?.data?.message || 'Logout failed');
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post('/users/refresh-token', {}, {
      withCredentials: true
    });

    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    return response.data.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/current-user');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get current user');
  }
};

export const changePassword = async (oldPassword, newPassword, confPassword) => {
  try {
    await api.post('/users/change-password', {
      oldPassword,
      newPassword,
      confPassword
    });
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Change password failed');
  }
};