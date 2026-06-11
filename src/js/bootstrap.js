import firebaseConfig from '../firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import './app.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// inject ads and basic analytics
onValue(ref(db,'ads'), snap=>{
  const data = snap.val() || {};
  // top banner
  const topZone = Object.values(data).filter(a=>a.zone === 'top_banner').map(a=>a.code).join('\n');
  if(topZone){ const el = document.createElement('div'); el.innerHTML = topZone; document.querySelector('.hero')?.appendChild(el); }
});

if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js').catch(()=>{}); }
