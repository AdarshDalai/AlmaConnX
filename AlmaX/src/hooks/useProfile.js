import { useState, useEffect } from 'react';
import { getProfileDetails, updateProfileDetails } from '../services/profileService';

export const useProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await getProfileDetails();
                setProfile(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const updateProfile = async (profileData) => {
        setLoading(true);
        try {
            const updatedProfile = await updateProfileDetails(profileData);
            setProfile(updatedProfile);
            return updatedProfile;
        } catch (err) {
            setError(err.message || 'Failed to update profile');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { profile, loading, error, updateProfile };
};