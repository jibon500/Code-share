import firebaseConfig from '../firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, onValue, push, set, update, get, child, query, orderByChild, limitToLast } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Utilities
const $ = id => document.getElementById(id);
const el = (tag, cls) => Object.assign(document.createElement(tag), { className: cls || '' });

// Local device keys to prevent multi-like
const LIKE_KEY = 'cs_likes_v1';
const LOVE_KEY = 'cs_loves_v1';
const VIEW_KEY = 'cs_views_v1';

// App elements
const categoriesGrid = $('categories-grid');
const projectsGrid = $('projects-grid');
const searchInput = $('search-input');
const searchBtn = $('search-btn');
const projectModal = $('project-modal');
const projectContent = $('project-content');
const modalClose = $('modal-close');
const processingPopup = $('processing-popup');
const progressBar = $('progress-bar');
const yearSpan = $('year');

yearSpan.textContent = new Date().getFullYear();

// Load categories
function loadCategories(){
  const categoriesRef = ref(db, 'categories');
  onValue(categoriesRef, snap => {
    categoriesGrid.innerHTML = '';
    const data = snap.val() || {};
    Object.keys(data).forEach(key => {
      const c = data[key];
      const card = el('div', 'cat-card');
      const img = el('img'); img.src = c.icon || '/assets/category-placeholder.png';
      const h = el('div'); h.textContent = c.name;
      card.appendChild(img); card.appendChild(h);
      card.onclick = () => filterByCategory(key, c.name);
      categoriesGrid.appendChild(card);
    });
  });
}

// Load latest projects
function loadProjects(){
  const projectsRef = ref(db, 'projects');
  onValue(projectsRef, snap => {
    projectsGrid.innerHTML = '';
    const data = snap.val() || {};
    const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    // sort by createdAt desc
    arr.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
    arr.forEach(p => projectsGrid.appendChild(projectCard(p)));
  });
}

function projectCard(p){
  const card = el('div','project-card');
  const img = el('img','project-thumb'); img.src = p.thumbnail || '/assets/project-placeholder.jpg';
  const title = el('h4'); title.textContent = p.title;
  const desc = el('p'); desc.textContent = p.shortDescription || '';
  const meta = el('div','project-meta');
  const stats = el('div'); stats.innerHTML = `<small>❤ ${p.loves||0}  👍 ${p.likes||0}  👁 ${p.views||0}</small>`;
  const actions = el('div','actions');
  const viewBtn = el('button','btn'); viewBtn.textContent='View'; viewBtn.onclick = ()=>openProject(p.id);
  const likeBtn = el('button','like-btn'); likeBtn.textContent='Like'; likeBtn.onclick = ()=>toggleLike(p.id);
  const loveBtn = el('button','love-btn'); loveBtn.textContent='Love'; loveBtn.onclick = ()=>toggleLove(p.id);
  actions.appendChild(viewBtn); actions.appendChild(likeBtn); actions.appendChild(loveBtn);
  meta.appendChild(stats); meta.appendChild(actions);
  card.appendChild(img); card.appendChild(title); card.appendChild(desc); card.appendChild(meta);
  return card;
}

function filterByCategory(catId, name){
  // simple client side filter
  const projectsRef = ref(db, 'projects');
  onValue(projectsRef, snap => {
    projectsGrid.innerHTML = '';
    const data = snap.val() || {};
    const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    const filtered = arr.filter(p=>p.categoryId===catId);
    filtered.forEach(p=>projectsGrid.appendChild(projectCard(p)));
  }, { onlyOnce: true });
}

// Open project details
function openProject(id){
  const pRef = ref(db, `projects/${id}`);
  get(pRef).then(snap=>{
    const p = snap.val();
    if(!p) return alert('Project not found');
    // increment unique view
    incrementView(id);
    renderProjectModal(id,p);
    projectModal.classList.remove('hidden');
  });
}

function renderProjectModal(id,p){
  projectContent.innerHTML = '';
  const img = el('img'); img.src = p.previewImages?.[0]||p.thumbnail||'/assets/project-placeholder.jpg'; img.style.width='100%';
  const title = el('h2'); title.textContent = p.title;
  const info = el('div'); info.innerHTML = `<p>${p.fullDescription||p.shortDescription||''}</p>`;
  const stats = el('div'); stats.innerHTML = `<small>❤ ${p.loves||0}  👍 ${p.likes||0}  👁 ${p.views||0}</small>`;
  // download buttons
  const downloadList = el('div');
  const downloads = p.downloads || {};
  Object.keys(downloads).forEach(k=>{
    const d = downloads[k];
    const btn = el('button','btn primary'); btn.textContent = d.name || 'Download';
    btn.onclick = ()=>smartDownloadFlow(d.smartLink || d.finalLink, d.finalLink);
    downloadList.appendChild(btn);
  });
  projectContent.appendChild(img); projectContent.appendChild(title); projectContent.appendChild(info); projectContent.appendChild(stats); projectContent.appendChild(downloadList);
}

modalClose.onclick = ()=> projectModal.classList.add('hidden');

// Smart download flow: open smart link then show processing, then open final link
function smartDownloadFlow(smartLink, finalLink){
  try{
    if(smartLink) window.open(smartLink,'_blank');
  }catch(e){}
  // show processing popup
  processingPopup.classList.remove('hidden');
  let progress = 0; progressBar.style.width='0%';
  const interval = setInterval(()=>{
    progress += Math.random()*20;
    if(progress>=100){ progress=100; progressBar.style.width='100%'; clearInterval(interval);
      setTimeout(()=>{ processingPopup.classList.add('hidden'); if(finalLink) window.open(finalLink,'_blank'); }, 600);
    } else { progressBar.style.width = progress+'%'; }
  }, 400);
}

// Views: unique per device
function incrementView(projectId){
  const viewed = JSON.parse(localStorage.getItem(VIEW_KEY) || '[]');
  if(viewed.includes(projectId)) return;
  viewed.push(projectId); localStorage.setItem(VIEW_KEY, JSON.stringify(viewed));
  const pRef = ref(db, `projects/${projectId}/views`);
  get(pRef).then(snap=>{ const v = snap.val()||0; set(pRef, v+1); }).catch(()=>{});
}

// Likes/Loves: one per device
function toggleLike(projectId){
  const likes = JSON.parse(localStorage.getItem(LIKE_KEY) || '[]');
  const pRef = ref(db, `projects/${projectId}/likes`);
  if(likes.includes(projectId)){
    // already liked -> ignore or optionally unlike
    return alert('You already liked this');
  }
  likes.push(projectId); localStorage.setItem(LIKE_KEY, JSON.stringify(likes));
  get(pRef).then(snap=>{ const v = snap.val()||0; set(pRef, v+1); }).catch(()=>{});
}
function toggleLove(projectId){
  const loves = JSON.parse(localStorage.getItem(LOVE_KEY) || '[]');
  const pRef = ref(db, `projects/${projectId}/loves`);
  if(loves.includes(projectId)){
    return alert('You already loved this');
  }
  loves.push(projectId); localStorage.setItem(LOVE_KEY, JSON.stringify(loves));
  get(pRef).then(snap=>{ const v = snap.val()||0; set(pRef, v+1); }).catch(()=>{});
}

// Search
searchBtn.onclick = ()=>{
  const q = searchInput.value.trim().toLowerCase(); if(!q) return loadProjects();
  const projectsRef = ref(db, 'projects');
  onValue(projectsRef, snap=>{
    projectsGrid.innerHTML='';
    const data = snap.val()||{}; const arr = Object.keys(data).map(k=>({id:k,...data[k]}));
    const res = arr.filter(p=>((p.title||'').toLowerCase().includes(q))||((p.shortDescription||'').toLowerCase().includes(q))||((p.tags||'').toLowerCase().includes(q)));
    res.forEach(p=>projectsGrid.appendChild(projectCard(p)));
  }, { onlyOnce: true });
}

// Init
loadCategories(); loadProjects();

// Expose for debugging
window.CS = { db, storage, openProject };

