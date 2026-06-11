// Admin init script to render extra managers
import { renderAdsManager } from './ads.js';
import { renderPagesManager } from './pages.js';
import { renderSeoManager } from './seo.js';
import { renderDownloadsManager, renderCommentsModeration } from './moderation.js';

// When admin page loads, render managers
window.addEventListener('DOMContentLoaded', ()=>{
  renderAdsManager(); renderPagesManager(); renderSeoManager(); renderDownloadsManager(); renderCommentsModeration();
});
