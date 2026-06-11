// SEO manager helper (simple save/load) - admin/js/seo.js
import firebaseConfig from '../../src/firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const seoForm = document.getElementById('seo-form');
const seoList = document.getElementById('seo-list');

export function renderSeoManager(){
  if(!seoForm) return;
  seoForm.innerHTML='';
  const page = document.createElement('input'); page.placeholder='Page or project slug';
  const title = document.createElement('input'); title.placeholder='Meta title';
  const desc = document.createElement('textarea'); desc.placeholder='Meta description'; desc.style.height='80px';
  const keywords = document.createElement('input'); keywords.placeholder='Meta keywords (comma)';
  const save = document.createElement('button'); save.className='btn primary'; save.textContent='Save SEO';
  save.onclick = ()=>{ if(!page.value) return alert('page required'); set(ref(db,`seo/${page.value}`), { title:title.value, description:desc.value, keywords:keywords.value }); page.value=''; title.value=''; desc.value=''; keywords.value=''; }
  seoForm.appendChild(page); seoForm.appendChild(title); seoForm.appendChild(desc); seoForm.appendChild(keywords); seoForm.appendChild(save);
  onValue(ref(db,'seo'), snap=>{ seoList.innerHTML=''; const data=snap.val()||{}; Object.keys(data).forEach(k=>{ const s=data[k]; const card=document.createElement('div'); card.className='card'; card.innerHTML=`<b>${k}</b><div><small>${s.title||''}</small></div>`; seoList.appendChild(card); }); });
}
