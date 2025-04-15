import api from '../utils/axiosConfig';

export const getProfileDetails = async () => {
    try {
        const response = await api.get('/profile');
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get profile details');
    }
};

export const updateProfileDetails = async (profileData) => {
    try {
        const response = await api.patch('/profile/update-details', profileData);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update profile details');
    }
};

export const updateAccountDetails = async (accountData) => {
    try {
        const response = await api.patch('/profile/update-account', accountData);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update account details');
    }
};

export const updateProfileAvatar = async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      console.log("Avatar file being sent:", avatarFile);
      
      const response = await api.patch('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw new Error(error.response?.data?.message || 'Failed to update profile avatar');
    }
  };
  
  export const updateProfileCoverImage = async (coverImageFile) => {
    try {
      const formData = new FormData();
      formData.append('coverImage', coverImageFile);
      
      const response = await api.patch('/profile/cover-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Error updating cover image:", error);
      throw new Error(error.response?.data?.message || 'Failed to update cover image');
    }
  };