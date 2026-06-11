// Extend main app: inject ads and track downloads
import './app.js';
import { injectAds } from './ads-client.js';

injectAds();

// register SW if available
if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js').catch(()=>{}); }
