import { Briefcase, Users, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { IUser } from '@/lib/utils';

interface ProfileCardProps {
  isOwnProfile: boolean;
  className?: string;
  userInfo?: IUser,
  isAdmin?: boolean
}

export const ProfileCard = ({ isOwnProfile, className, userInfo, isAdmin }: ProfileCardProps) => {
  const location = useLocation();
  if (!userInfo) return null;

  const { profilePicture, name, username, email, bio, department, friends } = userInfo;
  const shouldRender = (location.pathname.endsWith("/profile") || isOwnProfile || isAdmin) && location.pathname !== "/" ;

  return (
    <div className={`${className || 'fixed left-0 w-64 p-3 overflow-y-auto mt-16 ml-8'}`}>
      <div 
        className={`bg-white dark:bg-neutral-800 dark:border-neutral-700 rounded-lg shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl`}
      > 
        <div className="p-4">
          <h2 className="text-base font-semibold text-center text-gray-800 dark:text-gray-300 mb-3 pb-2 border-b dark:border-gray-300 border-gray-100">
            {isOwnProfile ? "My Profile" : `${name}'s Profile`}
          </h2>
          
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 p-0.5  hover:scale-105 cursor-pointer ">
                <div className="w-full h-full rounded-full overflow-hidden bg-whitetransition-transform duration-300">
                  <Link to="/profile" >
                    <img
                      className="w-full h-full object-cover"
                      src={profilePicture || '/avatar.jpeg'}
                      alt="Profile"
                    />
                  </Link>
                </div>
              </div>
            </div>
            
            <Link to="/profile" >
              <h3 className="text-sm font-bold text-gray-800 mb-1 cursor-pointer  dark:text-gray-300">{name}</h3>
            </Link>
            <Link to="/profile" >
              <p className="text-xs text-gray-500 mb-3 cursor-pointer">@{username}</p>
            </Link>
           
            <div className="p-2 mb-3 rounded-md text-xs text-gray-600 bg-gray-50 border border-gray-100 dark:bg-neutral-700 dark:border-gray-700">
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
            {shouldRender  && <div className="mb-3 p-2 rounded-md bg-gray-50 dark:bg-neutral-600  border border-gray-100">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                <Mail size={12} className="text-blue-500" />
                <span>{email}</span>
              </div>
            </div>}

            {isOwnProfile && (
              <Link to="/edit-profile" >
                <button 
                  className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-indigo-600 transition-colors"
                >
                  Edit Profile
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};