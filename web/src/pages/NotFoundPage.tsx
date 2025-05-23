import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/home');
    }
  }, [countdown, navigate]);
  
  const floatKeyframes = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }
  `;
  
  const blobKeyframes = `
    @keyframes blob {
      0% { transform: scale(1) translate(0px, 0px); }
      33% { transform: scale(1.1) translate(30px, -50px); }
      66% { transform: scale(0.9) translate(-20px, 20px); }
      100% { transform: scale(1) translate(0px, 0px); }
    }
  `;
  
  const animationStyles = `
    ${floatKeyframes}
    ${blobKeyframes}
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    .animate-blob {
      animation: blob 7s infinite;
    }
    
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    
    .animation-delay-4000 {
      animation-delay: 4s;
    }
  `;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-950 px-4">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      <div className="text-center">
        <div className="relative mb-6">
          <div className="animate-float">
            <h1 className="text-9xl font-extrabold text-blue-600 bg-clip-text">404</h1>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-2 dark:text-gray-100">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-2/4 right-1/4 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 dark:bg-neutral-800 rounded-md hover:bg-gray-300 dark:hover:bg-neutral-700 transition duration-300 dark:text-white"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:opacity-90 transition duration-300"
          >
            Go Home
          </button>
        </div>
        
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Redirecting to home page in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;