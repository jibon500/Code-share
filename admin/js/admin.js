import firebaseConfig from '../src/firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, push, set, onValue, remove, get, child, update } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

const authArea = document.getElementById('auth-area');
const settingsForm = document.getElementById('settings-form');
const categoryForm = document.getElementById('category-form');
const categoriesList = document.getElementById('categories-list');
const projectForm = document.getElementById('project-form');
const projectsList = document.getElementById('projects-list');

// Simple auth UI
function renderAuth(){
  authArea.innerHTML = '';
  const loginBtn = document.createElement('button'); loginBtn.className='btn'; loginBtn.textContent='Login';
  const logoutBtn = document.createElement('button'); logoutBtn.className='btn'; logoutBtn.textContent='Logout';
  loginBtn.onclick = ()=>showLogin(); logoutBtn.onclick = ()=>{ signOut(auth).then(()=>alert('Signed out')) };
  authArea.appendChild(loginBtn); authArea.appendChild(logoutBtn);
}

function showLogin(){
  const email = prompt('Admin email'); if(!email) return; const pass = prompt('Password'); if(!pass) return;
  signInWithEmailAndPassword(auth,email,pass).then(()=>alert('Logged in')).catch(e=>alert('Login failed: '+e.message));
}

// Settings form (simple key-value JSON editor)
function loadSettings(){
  settingsForm.innerHTML = '';
  const sRef = ref(db,'settings');
  onValue(sRef,snap=>{
    const data = snap.val() || {};
    const ta = document.createElement('textarea'); ta.style.width='100%'; ta.style.height='160px'; ta.value = JSON.stringify(data,null,2);
    const save = document.createElement('button'); save.className='btn primary'; save.textContent='Save Settings';
    save.onclick = ()=>{
      try{ const parsed = JSON.parse(ta.value); set(sRef, parsed).then(()=>alert('Settings saved')) }catch(e){ alert('Invalid JSON') }
    }
    settingsForm.appendChild(ta); settingsForm.appendChild(save);
  });
}

// Categories CRUD
function renderCategoryForm(){
  categoryForm.innerHTML='';
  const name = document.createElement('input'); name.placeholder='Category name';
  const slug = document.createElement('input'); slug.placeholder='Slug';
  const icon = document.createElement('input'); icon.placeholder='Icon URL';
  const add = document.createElement('button'); add.className='btn primary'; add.textContent='Add Category';
  add.onclick = ()=>{
    if(!name.value) return alert('Name required');
    push(ref(db,'categories'),{ name:name.value, slug:slug.value||name.value.toLowerCase().replace(/\s+/g,'-'), icon:icon.value||'' }).then(()=>{ name.value=''; slug.value=''; icon.value=''; });
  }
  categoryForm.appendChild(name); categoryForm.appendChild(slug); categoryForm.appendChild(icon); categoryForm.appendChild(add);
}

function loadCategoriesList(){
  categoriesList.innerHTML='';
  onValue(ref(db,'categories'),snap=>{
    categoriesList.innerHTML=''; const data = snap.val()||{};
    Object.keys(data).forEach(k=>{ const c=data[k]; const card=document.createElement('div'); card.className='card'; card.innerHTML=`<b>${c.name}</b> <small>${c.slug||''}</small>`;
      const del=document.createElement('button'); del.className='btn'; del.textContent='Delete'; del.onclick=()=>remove(ref(db,`categories/${k}`));
      card.appendChild(del); categoriesList.appendChild(card);
    });
  });
}

// Projects: simple create with downloads
function renderProjectForm(){
  projectForm.innerHTML='';
  const title = document.createElement('input'); title.placeholder='Project title';
  const category = document.createElement('input'); category.placeholder='Category ID (paste key)';
  const short = document.createElement('input'); short.placeholder='Short description';
  const full = document.createElement('textarea'); full.placeholder='Full description';
  const thumbnail = document.createElement('input'); thumbnail.type='file';
  const downloadsJson = document.createElement('textarea'); downloadsJson.placeholder='Downloads JSON (array) e.g.[{"name":"Source","finalLink":"https://..."}]'; downloadsJson.style.height='80px';
  const add = document.createElement('button'); add.className='btn primary'; add.textContent='Create Project';

  add.onclick = async ()=>{
    if(!title.value) return alert('Title required');
    const obj = { title: title.value, categoryId: category.value, shortDescription: short.value, fullDescription: full.value, createdAt: Date.now(), likes:0, loves:0, views:0 };
    const newRef = push(ref(db,'projects'));
    await set(newRef, obj);
    // upload thumbnail if provided
    if(thumbnail.files && thumbnail.files[0]){
      const f = thumbnail.files[0];
      const srefPath = sref(storage, `thumbnails/${newRef.key}/${f.name}`);
      uploadBytes(srefPath,f).then(snap=> getDownloadURL(srefPath).then(url=> update(newRef,{ thumbnail: url })));    }
    // downloads JSON
    try{ const dl = JSON.parse(downloadsJson.value||'[]'); if(dl.length) set(ref(db,`projects/${newRef.key}/downloads`), dl.reduce((acc,d,i)=>{acc['d'+i]=d;return acc},{}) ); }catch(e){/* ignore */}
    alert('Project created'); title.value='';category.value='';short.value='';full.value='';downloadsJson.value=''; thumbnail.value='';
  }

  projectForm.appendChild(title); projectForm.appendChild(category); projectForm.appendChild(short); projectForm.appendChild(full); projectForm.appendChild(thumbnail); projectForm.appendChild(downloadsJson); projectForm.appendChild(add);
}

function loadProjectsList(){
  projectsList.innerHTML='';
  onValue(ref(db,'projects'),snap=>{
    projectsList.innerHTML=''; const data = snap.val()||{};
    Object.keys(data).forEach(k=>{ const p=data[k]; const card=document.createElement('div'); card.className='card'; card.innerHTML=`<b>${p.title}</b><div><small>${p.shortDescription||''}</small></div>`;
      const del=document.createElement('button'); del.className='btn'; del.textContent='Delete'; del.onclick=()=>remove(ref(db,`projects/${k}`));
      card.appendChild(del); projectsList.appendChild(card);
    });
  });
}

// Init UI
renderAuth(); loadSettings(); renderCategoryForm(); loadCategoriesList(); renderProjectForm(); loadProjectsList();

