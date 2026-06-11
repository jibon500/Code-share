/* small analytics & ads injector for frontend */
import firebaseConfig from '../firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function injectAds(){
  onValue(ref(db,'ads'), snap=>{
    const data = snap.val() || {};
    const zones = {};
    Object.keys(data).forEach(k=>{ const a=data[k]; if(!zones[a.zone]) zones[a.zone]=[]; zones[a.zone].push(a.code); });
    // top banner
    const top = document.querySelector('.hero');
    if(top && zones.top_banner){ const div = document.createElement('div'); div.innerHTML = zones.top_banner.join('\n'); div.style.marginTop='12px'; top.appendChild(div); }
  });
}

export function trackEvent(name, payload){
  // lightweight event log — write to /analytics/events
  const evtRef = ref(db, `analytics/events`);
  // push is intentionally omitted to avoid large writes in client; recommend a cloud function for production
}
