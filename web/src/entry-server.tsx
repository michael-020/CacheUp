import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { useForumStore } from './stores/ForumStore/useforumStore';
import { axiosInstance } from './lib/axios';

async function fetchInitialData(url: string) {
  const urlObj = new URL(url, 'http://localhost');
  const path = urlObj.pathname;

  // Initialize store data structure
  const initialData: any = {
    forums: [],
    notifications: [],
    loading: true,
    error: '',
    searchResult: { msg: '', searchResults: [] },
    currentForum: {
      title: '',
      threads: [],
      loading: false,
      error: ''
    }
  };

  try {
    // Handle forums list page
    if (path === '/forums/get-forums') {
      const [forumsResponse, notificationsResponse] = await Promise.all([
        axiosInstance.get('/forums/view-forums'),
        axiosInstance.get('/forums/notification').catch(() => ({ data: { notifications: [] } }))
      ]);

      initialData.forums = forumsResponse.data.allForums;
      initialData.notifications = notificationsResponse.data.notifications;
      initialData.loading = false;
    }

    // Handle forum detail page
    if (path.startsWith('/forums/') && path.split('/').length === 4) {
      const [, , forumId, weaviateId] = path.split('/');
      const [forumData, threadsData] = await Promise.all([
        axiosInstance.get(`/forums/view-forums/${forumId}`),
        axiosInstance.get(`/forums/view-threads/${forumId}`)
      ]);

      initialData.currentForum = {
        title: forumData.data.forum.title,
        threads: threadsData.data.allThreads,
        loading: false,
        error: ''
      };
    }

  } catch (error) {
    console.error('Error fetching initial data:', error);
    initialData.error = 'Failed to load data';
    initialData.loading = false;
  }

  return initialData;
}

export async function render(url: string) {
  // Fetch data before rendering
  const initialData = await fetchInitialData(url);
  
  // Initialize store with fetched data
  useForumStore.setState({
    ...useForumStore.getState(),
    ...initialData
  });

  // Render the app
  const html = renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  );

  return { html, initialState: initialData };
}