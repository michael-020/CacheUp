import './index.css'
import App from './App'
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

hydrateRoot(document.getElementById('root')!, <BrowserRouter><App /></BrowserRouter>);