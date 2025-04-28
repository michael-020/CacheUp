import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { axiosInstance } from '@/lib/axios';

export const TimeTracker = () => {
  const location = useLocation();
  const startTime = useRef(Date.now());
  const pageViewLogged = useRef(false);

  useEffect(() => {
    startTime.current = Date.now();
    pageViewLogged.current = false;

    return () => {
      if (!pageViewLogged.current) {
        const timeSpent = (Date.now() - startTime.current) / 1000 / 60; // Convert to minutes
        logPageView(location.pathname, timeSpent);
        pageViewLogged.current = true;
      }
    };
  }, [location]);

  const logPageView = async (page: string, timeSpent: number) => {
    try {
      await axiosInstance.post('/user/log-page-view', {
        page,
        timeSpent
      });
    } catch (error) {
      console.error('Error logging page view:', error);
    }
  };

  return null; // This is a tracking component, no UI needed
};