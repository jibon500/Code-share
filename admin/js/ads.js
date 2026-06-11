// Ads manager admin UI (simple CRUD) - admin/js/ads.js
import firebaseConfig from '../../src/firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, push, onValue, remove, update } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const adsFormContainer = document.getElementById('ads-form');
const adsListContainer = document.getElementById('ads-list');

export function renderAdsManager(){
  if(!adsFormContainer) return;
  adsFormContainer.innerHTML = '';
  const zone = document.createElement('input'); zone.placeholder='Ad zone name (top_banner, bottom_native, popunder)';
  const code = document.createElement('textarea'); code.placeholder='Ad HTML/JS code'; code.style.height='100px';
  const add = document.createElement('button'); add.className='btn primary'; add.textContent='Add Ad';
  add.onclick = ()=>{ if(!zone.value) return alert('zone required'); push(ref(db,'ads'), { zone: zone.value, code: code.value, createdAt: Date.now() }); zone.value=''; code.value=''; }
  adsFormContainer.appendChild(zone); adsFormContainer.appendChild(code); adsFormContainer.appendChild(add);
  // list
  onValue(ref(db,'ads'), snap=>{
    adsListContainer.innerHTML=''; const data = snap.val()||{}; Object.keys(data).forEach(k=>{ const a=data[k]; const card=document.createElement('div'); card.className='card'; card.innerHTML=`<b>${a.zone}</b><pre style="white-space:pre-wrap">${a.code.substring(0,200)}</pre>`;
      const del=document.createElement('button'); del.className='btn'; del.textContent='Delete'; del.onclick=()=>remove(ref(db,`ads/${k}`));
      card.appendChild(del); adsListContainer.appendChild(card);
    });
  });
}
