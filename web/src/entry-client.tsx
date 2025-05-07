import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useForumStore } from './stores/ForumStore/useforumStore';

// Get initial state that was injected into the HTML
const initialState = (window as any).__INITIAL_STATE__;

// Initialize store with server state before hydration
if (initialState) {
  useForumStore.setState({
    ...useForumStore.getState(),
    ...initialState,
    loading: false
  });
}

hydrateRoot(
  document.getElementById('root')!,
    <BrowserRouter>
      <App />
    </BrowserRouter>
);