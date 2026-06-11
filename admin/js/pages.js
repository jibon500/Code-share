// Pages manager (About, Contact, Privacy etc.) - admin/js/pages.js
import firebaseConfig from '../../src/firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const pagesFormContainer = document.getElementById('pages-form');
const pagesListContainer = document.getElementById('pages-list');

export function renderPagesManager(){
  if(!pagesFormContainer) return;
  pagesFormContainer.innerHTML='';
  const slug = document.createElement('input'); slug.placeholder='slug (about, contact, privacy)';
  const title = document.createElement('input'); title.placeholder='Title';
  const content = document.createElement('textarea'); content.placeholder='HTML content here'; content.style.height='160px';
  const save = document.createElement('button'); save.className='btn primary'; save.textContent='Save Page';
  save.onclick = ()=>{ if(!slug.value) return alert('slug required'); set(ref(db,`pages/${slug.value}`), { title: title.value, content: content.value, updatedAt: Date.now() }); slug.value=''; title.value=''; content.value=''; }
  pagesFormContainer.appendChild(slug); pagesFormContainer.appendChild(title); pagesFormContainer.appendChild(content); pagesFormContainer.appendChild(save);
  // list
  onValue(ref(db,'pages'), snap=>{ pagesListContainer.innerHTML=''; const data = snap.val()||{}; Object.keys(data).forEach(k=>{ const p = data[k]; const card=document.createElement('div'); card.className='card'; card.innerHTML=`<b>/${k}</b> <div><small>${p.title||''}</small></div>`; pagesListContainer.appendChild(card); }); });
}
