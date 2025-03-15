import profile from '../assets/profile.png'
import { IUser } from '@/lib/utils'
import { Button } from './Button'


export const ProfileCard = ({user, isOwnProfile,}: {user: IUser | null | undefined, isOwnProfile: boolean,}) => {

    
  function onclickHandler () {
    console.log("Baad me edit kardena")
  }

    return <div className='bg-white mt-20 mr-7 rounded-lg p-5'>
         <h1 className='text-center text-xl font-bold'>{isOwnProfile ? "My Profile" : `${user?.name}'s Profile`}</h1>
         <p className='text-lg text-center font-medium'> {user?.username} </p>
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
                    <p> {user?.name}</p>
                    <p>Department: {user?.department}</p>
                    <p> {user?.bio}</p>
                </div>
                <div className='w-[50%] self-center'>
                    {isOwnProfile && <Button onClick={onclickHandler} label="Edit" active={false} /> }
                

                </div>
            </div>
        </div>
    </div>
} 










