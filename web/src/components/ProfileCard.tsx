import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
// import axios from 'axios';
import { User, Briefcase, Users } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';

interface UserProfile {
  profileImagePath: string;
  name: string;
  username: string;
  bio: string;
  department: string;
  friends: string[];
}

export const ProfileCard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/user/viewProfile")

        setUserProfile(res.data.userInfo);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data', err);
        setError('Failed to load profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse ">
        <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="h-5 bg-gray-300 rounded w-2/3 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
        <div className="h-16 bg-gray-300 rounded w-full mb-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-md p-4">
        <p className="text-red-500 text-center font-medium">{error}</p>
      </div>
    );
  }

  if (!userProfile) return null;

  const { profileImagePath, name, username, bio, department, friends } = userProfile;

  return (
    <div className="fixed left-0 w-72 h-screen p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 transition-all duration-300 ease-in-out hover:shadow-xl">
        <div className="profile-section mb-4 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full ring-2 ring-blue-500 ring-offset-2">
            <img
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              src={
                profileImagePath
                  ? `http://localhost:3000${profileImagePath}`
                  : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfOc2xqD2qG5m9jhgVOuAzLQj8Yotn8Ydp-Q&s'
              }
              alt="Profile"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">{name}</h2>
          <h3 className="text-sm text-gray-600 mb-2">@{username}</h3>
          <p className="text-sm text-gray-700 mb-2 italic bg-gray-100 p-1 rounded-md">
            {bio || 'No bio available'}
          </p>
          <div className="flex justify-center space-x-4 text-sm text-gray-700 mb-4">
            <div className="flex flex-col items-center">
              <Briefcase className="mb-1 text-blue-500" size={18} />
              <span className="font-medium">{department}</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="mb-1 text-blue-500" size={18} />
              <span className="font-medium">{friends?.length || 0} Friends</span>
            </div>
          </div>
          <NavLink
            to="/profile"
            className="flex items-center justify-center w-full p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200 font-semibold"
          >
            <User className="mr-1" size={20} /> View Profile
          </NavLink>
        </div>
      </div>
    </div>
  );
};

