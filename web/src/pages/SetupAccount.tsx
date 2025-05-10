import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader, Upload, X } from 'lucide-react';
import { useAuthStore } from '@/stores/AuthStore/useAuthStore';
import { toast } from 'react-hot-toast';
import { SetupFormData, setupSchema } from '@/lib/utils';
import { routeVariants } from '@/lib/routeAnimation';

export const SetupAccount = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showProfileInput, setShowProfileInput] = useState(true);
  const { setupGoogleAccount, checkSetupSession, isSettingUp } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema)
  });

  useEffect(() => {
    const verifySession = async () => {
      try {
        await checkSetupSession();
      } catch (error) {
        console.error("Error: ", error)
        toast.error('Please complete signup first');
        navigate('/verify-email');
      }
    };
    verifySession();
  }, [navigate, checkSetupSession]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setValue('profilePicture', result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProfileInput = () => {
    if (showProfileInput) {
      // Clear the profile picture when hiding
      setValue('profilePicture', '');
      setImagePreview(null);
    }
    setShowProfileInput(!showProfileInput);
  };

  const onSubmit = async (data: SetupFormData) => {
    try {
      await setupGoogleAccount(data);
      navigate('/home');
    } catch (error) {
      // Error is handled in the store
      console.log("error: ", error)
    }
  };

  return (
      <motion.div
        className="min-h-[99vh] pb-12 pt-12 sm:pt-0 sm:pb-0 flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4"
        variants={routeVariants}
        initial="initial"
        animate="final"
        exit="exit"
        >
        <div 
          className="max-w-lg w-full p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-lg"
          >
          <div>
            <h1 className="text-3xl font-black text-blue-600 text-center">
              Complete Your Profile
            </h1>
            <p className="mt-2 text-center text-gray-500 dark:text-gray-200">
              Just a few more details to get you started
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-3">
              {/* Name Input */}
              <div className="grid gap-2">
                <label className="text-gray-600 dark:text-gray-200 sm:translate-y-4">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-2 sm:py-0 dark:bg-gray-600/60 dark:text-gray-100 dark:placeholder:text-gray-400/40 bg-blue-50/50 border border-gray-200 dark:border-neutral-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-gray-600 dark:text-gray-200">
                  Username
                </label>
                <input
                  {...register('username')}
                  className="w-full px-4 py-2 dark:bg-gray-600/60 dark:text-gray-100 dark:placeholder:text-gray-400/40 bg-blue-50/50 border border-gray-200 dark:border-neutral-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-gray-600 dark:text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-2 dark:bg-gray-600/60 dark:text-gray-100 dark:placeholder:text-gray-400/40 bg-blue-50/50 border border-gray-200 dark:border-neutral-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 dark:hover:text-gray-100 hover:text-gray-700"
                    >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-gray-600 dark:text-gray-200">
                  Confirm Password
                </label>
                <div className='relative'>
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-4 py-2 dark:bg-gray-600/60 dark:text-gray-100 dark:placeholder:text-gray-400/40 bg-blue-50/50 border border-gray-200 dark:border-neutral-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    />
                  <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 dark:hover:text-gray-100 hover:text-gray-700"
                      >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Profile Picture Section with Show/Hide Toggle */}
              {showProfileInput ? (
                <div className="grid gap-2 col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-gray-600 dark:text-gray-200">
                      Profile Picture (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={toggleProfileInput}
                      className="text-sm text-blue-500 hover:text-blue-600"
                      >
                      Set up later
                    </button>
                  </div>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Profile Preview" 
                        className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-blue-500"
                        />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setValue('profilePicture', '');
                        }}
                        className="absolute top-0 right-0 bg-neutral-500 rounded-full p-1 text-white hover:bg-neutral-600"
                        >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex justify-center px-6 py-4 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                    >
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span>Click to upload a profile picture</span>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        />
                    </div>
                  )}
                  {errors.profilePicture && (
                    <p className="text-sm text-red-600">{errors.profilePicture.message}</p>
                  )}
                </div>
              ) : (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={toggleProfileInput}
                    className="text-blue-500 font-medium hover:text-blue-600"
                    >
                    Set up profile picture now
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSettingUp}
              className={`w-full py-2.5 px-4 mt-4 ${isSettingUp ? "bg-blue-800": ""} bg-blue-600 hover:bg-blue-700 dark:text-gray-200 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
              {isSettingUp ? <Loader className='animate-spin place-self-center' /> : 'Complete Setup'}
            </button>
          </form>
        </div>
      </motion.div>
  );
};