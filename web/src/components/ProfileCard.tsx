

import { useEffect, useState } from 'react';
import { Briefcase, Users, Edit, Mail } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { IUser } from '@/lib/utils';

interface UserProfile extends IUser {
  profileImagePath?: string;
  friends?: IUser[];
}

interface ProfileCardProps {
  user: UserProfile | null | undefined;
  isOwnProfile: boolean;
}

export const ProfileCard = ({ user, isOwnProfile }: ProfileCardProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/user/viewProfile');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse w-64 ml-6">
        <div className="h-5 bg-gray-300 rounded w-2/3 mx-auto mb-3"></div>
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-10 bg-gray-300 rounded w-full mb-3"></div>
        <div className="h-6 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-md p-3 ml-6 w-64">
        <p className="text-red-500 text-center text-sm">{error}</p>
      </div>
    );
  }

  if (!user) return null;

  // Use mock data for email if not provided
  const email = user.email || 'user@example.com';
  const { profileImagePath, name, username, bio, department, friends } = user;

  const handleEditClick = () => {
    console.log('Edit profile');
  };

  return (
    <div className="fixed left-0 w-64 p-3 overflow-y-auto mt-16 ml-8">
      <div 
        className={`bg-white rounded-lg shadow-lg border border-gray-100 transition-all duration-300 ${
          isHovered ? 'shadow-xl' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg" />
        
        <div className="p-4">
          <h2 className="text-base font-semibold text-center text-gray-800 mb-3 pb-2 border-b border-gray-100">
            {isOwnProfile ? "My Profile" : `${name}'s Profile`}
          </h2>
          
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      profileImagePath
                        ? `http://localhost:3000${profileImagePath}`
                        : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfOc2xqD2qG5m9jhgVOuAzLQj8Yotn8Ydp-Q&s'
                    }
                    alt="Profile"
                  />
                </div>
              </div>
              
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full cursor-pointer">
                  <Edit className="text-white" size={16} />
                </div>
              )}
            </div>
            
            <h3 className="text-sm font-bold text-gray-800 mb-1">{name}</h3>
            <p className="text-xs text-gray-500 mb-3">@{username}</p>
            
            <div className="p-2 mb-3 rounded-md text-xs text-gray-600 bg-gray-50 border border-gray-100">
              <p className="line-clamp-3">{bio || 'No bio available'}</p>
            </div>
            
            <div className="flex gap-2 mb-3">
              <div className="flex-1 p-2 rounded-md bg-blue-50 border border-blue-100">
                <Briefcase className="mx-auto mb-1 text-blue-500" size={14} />
                <p className="text-xs text-gray-700">{department}</p>
              </div>
              <div className="flex-1 p-2 rounded-md bg-indigo-50 border border-indigo-100">
                <Users className="mx-auto mb-1 text-indigo-500" size={14} />
                <p className="text-xs text-gray-700">{friends?.length || 0}</p>
              </div>
            </div>
            
            <div className="mb-3 p-2 rounded-md bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                <Mail size={12} className="text-blue-500" />
                <span>{email}</span>
              </div>
            </div>

            {isOwnProfile && (
              <button 
                onClick={handleEditClick}
                className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-indigo-600 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};