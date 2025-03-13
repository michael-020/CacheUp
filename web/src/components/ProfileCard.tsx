import profile from '../assets/profile.png'
import { IUser } from '@/lib/utils'
import { Button } from './Button'

export const ProfileCard = ({user, isOwnProfile,}: {user: IUser | null, isOwnProfile: boolean,}) => {


    return <div className='bg-white w-[20%] h-[60%] mt-20 rounded-lg'>
         <h1 className='text-center text-xl font-bold'>{isOwnProfile ? "My Profile" : `${user?.name}'s Profile`}</h1>
         <div className='flex justify-center'>
            <div className='flex flex-col justify-center'>
                <div className='flex justify-center m-4'>
                {user?.profileImagePath ? (
                        <img 
                            src={user.profileImagePath} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <img src={profile} className='w-24 h-24 object-cover'/>
                    )}
                </div>
                <div className='text-center text-base font-normal'>
                    <p> {user?.username} </p>
                    <p> {user?.name}</p>
                    <p> {user?.bio}</p>
                </div>
            </div>
        </div>
    </div>
} 










