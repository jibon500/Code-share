/* Admin: downloads manager & comments moderation UI */
import { renderAdsManager } from './ads.js';
import { renderPagesManager } from './pages.js';
import { renderSeoManager } from './seo.js';
import firebaseConfig from '../../src/firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, onValue, update } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const downloadsList = document.getElementById('downloads-list');
const commentsModerationList = document.getElementById('comments-moderation');

export function renderDownloadsManager(){
  if(!downloadsList) return;
  onValue(ref(db,'projects'), snap=>{
    downloadsList.innerHTML=''; const data = snap.val()||{}; Object.keys(data).forEach(k=>{ const p=data[k]; const card=document.createElement('div'); card.className='card'; card.innerHTML=`<b>${p.title}</b> <div>Downloads: ${p.downloadsCount||0}</div>`;
      const reset=document.createElement('button'); reset.className='btn'; reset.textContent='Reset Count'; reset.onclick=()=>update(ref(db,`projects/${k}`),{ downloadsCount:0 });
      card.appendChild(reset); downloadsList.appendChild(card);
    });
  });
}

export function renderCommentsModeration(){
  if(!commentsModerationList) return;
  onValue(ref(db,'comments'), snap=>{
    commentsModerationList.innerHTML=''; const data = snap.val()||{};
    Object.keys(data).forEach(pid=>{
      const per = data[pid]||{}; Object.keys(per).forEach(cid=>{ const c = per[cid]; const card=document.createElement('div'); card.className='card'; card.innerHTML=`<b>${pid}</b> <div>${c.name}: ${c.comment}</div>`;
        const approve=document.createElement('button'); approve.className='btn primary'; approve.textContent='Approve'; approve.onclick=()=>update(ref(db,`comments/${pid}/${cid}`),{ approved:true });
        const del=document.createElement('button'); del.className='btn'; del.textContent='Delete'; del.onclick=()=>update(ref(db,`comments/${pid}/${cid}`),{ deleted:true });
        card.appendChild(approve); card.appendChild(del); commentsModerationList.appendChild(card);
      });
    });
  });
}
