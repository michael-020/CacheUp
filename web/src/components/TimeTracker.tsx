import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { axiosInstance } from '@/lib/axios';

export const TimeTracker = () => {
  const location = useLocation();
  const startTime = useRef(Date.now());
  const pageViewLogged = useRef(false);
  const lastActiveTime = useRef(Date.now());
  const heartbeatInterval = useRef<NodeJS.Timeout>();

  const logPageTime = async (isHeartbeat: boolean = false) => {
    if (!pageViewLogged.current || isHeartbeat) {
      const timeSpent = (Date.now() - startTime.current) / 1000 / 60; // Convert to minutes
      try {
        await axiosInstance.post('/user/log-page-view', {
          page: location.pathname,
          timeSpent: Math.max(0, timeSpent),
          isHeartbeat
        });
        if (!isHeartbeat) {
          pageViewLogged.current = true;
        }
      } catch (error) {
        console.error('Error logging page view:', error);
      }
    }
  };

  useEffect(() => {
    startTime.current = Date.now();
    lastActiveTime.current = Date.now();
    pageViewLogged.current = false;

    // Heartbeat every 5 minutes to update active session
    heartbeatInterval.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        logPageTime(true);
      }
    }, 300000); // 5 minutes

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logPageTime();
        // Clear heartbeat when tab is hidden
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
        }
      } else {
        // Reset timer and restart heartbeat when tab becomes visible
        startTime.current = Date.now();
        pageViewLogged.current = false;
        heartbeatInterval.current = setInterval(() => {
          logPageTime(true);
        }, 300000);
      }
    };

    // Handle user activity
    const handleUserActivity = () => {
      lastActiveTime.current = Date.now();
    };

    // Handle page unload
    const handleUnload = () => {
      logPageTime();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);
    
    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    return () => {
      logPageTime();
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [location]);

  return null;
};