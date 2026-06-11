import firebaseConfig from '../firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, onValue, push, set, update, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// ============ UTILITIES ============
const $ = id => document.getElementById(id);
const el = (tag, cls) => Object.assign(document.createElement(tag), { className: cls || '' });

// Local storage keys
const LIKE_KEY = 'cs_likes_v1';
const LOVE_KEY = 'cs_loves_v1';
const VIEW_KEY = 'cs_views_v1';

// Technologies list
const TECHNOLOGIES = [
  { name: 'HTML5', icon: '🌐' },
  { name: 'CSS3', icon: '🎨' },
  { name: 'JavaScript', icon: '⚡' },
  { name: 'PHP', icon: '🐘' },
  { name: 'Laravel', icon: '🚀' },
  { name: 'React', icon: '⚛️' },
  { name: 'Vue', icon: '💚' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'Python', icon: '🐍' },
  { name: 'Java', icon: '☕' },
  { name: 'Kotlin', icon: '📱' },
  { name: 'Flutter', icon: '🦋' },
  { name: 'Firebase', icon: '🔥' },
  { name: 'MySQL', icon: '🗄️' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'PostgreSQL', icon: '🐘' }
];

// ============ DOM ELEMENTS ============
const categoriesGrid = $('categories-grid');
const featuredGrid = $('featured-grid');
const latestGrid = $('latest-grid');
const popularGrid = $('popular-grid');
const techGrid = $('tech-grid');
const searchInput = $('search-input');
const searchBtn = $('search-btn');
const btnSearch = $('btn-search');
const btnCategories = $('btn-categories');
const btnMenu = $('btn-menu');
const mobileMenu = $('mobile-menu');
const menuOverlay = $('menu-overlay');
const menuClose = $('menu-close');
const projectModal = $('project-modal');
const projectContent = $('project-content');
const modalClose = $('modal-close');
const processingPopup = $('processing-popup');
const progressBar = $('progress-bar');
const yearSpan = $('year');

// ============ INITIALIZATION ============
yearSpan.textContent = new Date().getFullYear();

// Responsive menu toggle
if (window.innerWidth <= 768) {
  btnMenu.style.display = 'block';
  btnSearch.style.display = 'none';
  btnCategories.style.display = 'none';
}

window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    btnMenu.style.display = 'block';
    btnSearch.style.display = 'none';
    btnCategories.style.display = 'none';
  } else {
    btnMenu.style.display = 'none';
    btnSearch.style.display = 'block';
    btnCategories.style.display = 'block';
  }
});

// Mobile menu handlers
if (btnMenu) btnMenu.onclick = () => {
  mobileMenu.classList.remove('hidden');
};
if (menuClose) menuClose.onclick = () => {
  mobileMenu.classList.add('hidden');
};
if (menuOverlay) menuOverlay.onclick = () => {
  mobileMenu.classList.add('hidden');
};

// Modal close
if (modalClose) modalClose.onclick = () => projectModal.classList.add('hidden');

// ============ LOAD TECHNOLOGIES ============
function loadTechnologies() {
  if (!techGrid) return;
  techGrid.innerHTML = '';
  TECHNOLOGIES.forEach(tech => {
    const card = el('div', 'tech-card');
    card.innerHTML = `<div class="tech-icon">${tech.icon}</div><div class="tech-name">${tech.name}</div>`;
    techGrid.appendChild(card);
  });
}

// ============ LOAD CATEGORIES ============
function loadCategories() {
  if (!categoriesGrid) return;
  categoriesGrid.innerHTML = '<p class="loading">Loading categories...</p>';
  
  const categoriesRef = ref(db, 'categories');
  onValue(categoriesRef, snap => {
    categoriesGrid.innerHTML = '';
    const data = snap.val() || {};
    const categories = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    
    if (categories.length === 0) {
      categoriesGrid.innerHTML = '<p class="no-data">No categories available</p>';
      return;
    }
    
    categories.forEach(cat => {
      const card = el('div', 'category-card');
      card.innerHTML = `
        <div class="cat-icon">${cat.icon || '📁'}</div>
        <h4>${cat.name}</h4>
        <p class="cat-count">${cat.projectCount || 0} projects</p>
      `;
      card.onclick = () => filterByCategory(cat.id, cat.name);
      categoriesGrid.appendChild(card);
    });
  });
}

// ============ LOAD PROJECTS ============
function loadProjects() {
  const projectsRef = ref(db, 'projects');
  onValue(projectsRef, snap => {
    const data = snap.val() || {};
    const projects = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    
    // Featured projects
    const featured = projects.filter(p => p.featured).slice(0, 4);
    if (featuredGrid) {
      featuredGrid.innerHTML = featured.length ? '' : '<p class="no-data">No featured projects</p>';
      featured.forEach(p => featuredGrid.appendChild(projectCard(p)));
    }
    
    // Latest projects (sorted by date)
    const latest = [...projects].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 4);
    if (latestGrid) {
      latestGrid.innerHTML = latest.length ? '' : '<p class="no-data">No projects yet</p>';
      latest.forEach(p => latestGrid.appendChild(projectCard(p)));
    }
    
    // Popular projects (sorted by views)
    const popular = [...projects].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
    if (popularGrid) {
      popularGrid.innerHTML = popular.length ? '' : '<p class="no-data">No popular projects</p>';
      popular.forEach(p => popularGrid.appendChild(projectCard(p)));
    }
  });
}

// ============ PROJECT CARD ============
function projectCard(p) {
  const card = el('div', 'project-card');
  card.innerHTML = `
    <div class="project-image">
      <img src="${p.thumbnail || '/assets/placeholder.png'}" alt="${p.title}" onerror="this.src='/assets/placeholder.png'">
      <span class="category-badge">${p.categoryName || 'General'}</span>
    </div>
    <div class="project-body">
      <h4 class="project-title">${p.title}</h4>
      <p class="project-desc">${(p.shortDescription || '').substring(0, 60)}...</p>
      <div class="project-stats">
        <span>❤️ ${p.loves || 0}</span>
        <span>👍 ${p.likes || 0}</span>
        <span>👁️ ${p.views || 0}</span>
      </div>
      <button class="btn btn-primary btn-block" onclick="window.openProject('${p.id}')">View Details</button>
    </div>
  `;
  return card;
}

// ============ OPEN PROJECT ============
window.openProject = function(id) {
  const pRef = ref(db, `projects/${id}`);
  get(pRef).then(snap => {
    const p = snap.val();
    if (!p) return alert('Project not found');
    incrementView(id);
    renderProjectModal(id, p);
    projectModal.classList.remove('hidden');
  }).catch(err => console.error(err));
};

// ============ RENDER PROJECT MODAL ============
function renderProjectModal(id, p) {
  projectContent.innerHTML = `
    <div class="project-full">
      <img src="${p.thumbnail || '/assets/placeholder.png'}" alt="${p.title}" class="project-full-image" onerror="this.src='/assets/placeholder.png'">
      
      <h2>${p.title}</h2>
      <p class="meta">By <strong>${p.author || 'Unknown'}</strong> • Version ${p.version || '1.0'}</p>
      
      <div class="stats-bar">
        <span>❤️ ${p.loves || 0} Loves</span>
        <span>👍 ${p.likes || 0} Likes</span>
        <span>👁️ ${p.views || 0} Views</span>
      </div>
      
      <div class="project-info">
        <h3>📋 Description</h3>
        <p>${p.fullDescription || p.shortDescription || 'No description'}</p>
        
        ${p.features ? `<h3>⭐ Features</h3><p>${p.features}</p>` : ''}
        ${p.requirements ? `<h3>⚙️ Requirements</h3><p>${p.requirements}</p>` : ''}
        ${p.changelog ? `<h3>📝 Changelog</h3><p>${p.changelog}</p>` : ''}
      </div>
      
      <div class="downloads-section">
        <h3>📥 Downloads</h3>
        <div class="download-buttons" id="download-buttons"></div>
      </div>
      
      <div class="actions">
        <button class="btn btn-success" onclick="window.toggleLike('${id}')">👍 Like</button>
        <button class="btn btn-danger" onclick="window.toggleLove('${id}')">❤️ Love</button>
      </div>
      
      <div class="comments-section">
        <h3>💬 Comments</h3>
        <div id="comments-list"></div>
        <div class="comment-form">
          <input type="text" id="comment-name" placeholder="Your name" maxlength="50">
          <textarea id="comment-text" placeholder="Your comment" maxlength="500" rows="3"></textarea>
          <button class="btn btn-primary" onclick="window.postComment('${id}')">Post Comment</button>
        </div>
      </div>
    </div>
  `;
  
  // Load downloads
  const downloads = p.downloads || {};
  const dlBtn = document.getElementById('download-buttons');
  if (dlBtn) {
    if (Object.keys(downloads).length === 0) {
      dlBtn.innerHTML = '<p>No downloads available</p>';
    } else {
      Object.keys(downloads).forEach(k => {
        const d = downloads[k];
        const btn = el('button', 'btn btn-primary');
        btn.textContent = `📥 ${d.name || 'Download'}`;
        btn.onclick = () => smartDownloadFlow(d.smartLink, d.finalLink);
        dlBtn.appendChild(btn);
      });
    }
  }
  
  // Load comments
  loadComments(id);
}

// ============ COMMENTS ============
function loadComments(projectId) {
  const commentsList = document.getElementById('comments-list');
  if (!commentsList) return;
  
  const commentsRef = ref(db, `comments/${projectId}`);
  onValue(commentsRef, snap => {
    commentsList.innerHTML = '';
    const data = snap.val() || {};
    const comments = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    
    const approved = comments.filter(c => c.approved).sort((a, b) => b.createdAt - a.createdAt);
    
    if (approved.length === 0) {
      commentsList.innerHTML = '<p class="no-data">No comments yet</p>';
      return;
    }
    
    approved.forEach(c => {
      const div = el('div', 'comment');
      div.innerHTML = `
        <div class="comment-header">
          <strong>${c.name}</strong>
          <small>${new Date(c.createdAt).toLocaleDateString()}</small>
        </div>
        <p>${c.comment}</p>
      `;
      commentsList.appendChild(div);
    });
  });
}

window.postComment = function(projectId) {
  const nameEl = document.getElementById('comment-name');
  const textEl = document.getElementById('comment-text');
  
  const name = nameEl.value.trim();
  const comment = textEl.value.trim();
  
  if (!name || !comment) {
    alert('Please enter name and comment');
    return;
  }
  
  const commentsRef = ref(db, `comments/${projectId}`);
  push(commentsRef, {
    name,
    comment,
    createdAt: Date.now(),
    approved: false
  }).then(() => {
    nameEl.value = '';
    textEl.value = '';
    alert('Comment submitted! Waiting for approval.');
  }).catch(err => {
    alert('Error posting comment');
    console.error(err);
  });
};

// ============ VIEWS ============
function incrementView(projectId) {
  const viewed = JSON.parse(localStorage.getItem(VIEW_KEY) || '[]');
  if (viewed.includes(projectId)) return;
  
  viewed.push(projectId);
  localStorage.setItem(VIEW_KEY, JSON.stringify(viewed));
  
  const pRef = ref(db, `projects/${projectId}/views`);
  get(pRef).then(snap => {
    const v = snap.val() || 0;
    set(pRef, v + 1);
  }).catch(() => {});
}

// ============ LIKES & LOVES ============
window.toggleLike = function(projectId) {
  const likes = JSON.parse(localStorage.getItem(LIKE_KEY) || '[]');
  
  if (likes.includes(projectId)) {
    alert('You already liked this project');
    return;
  }
  
  likes.push(projectId);
  localStorage.setItem(LIKE_KEY, JSON.stringify(likes));
  
  const pRef = ref(db, `projects/${projectId}/likes`);
  get(pRef).then(snap => {
    const v = snap.val() || 0;
    set(pRef, v + 1);
    alert('Thank you for liking!');
  });
};

window.toggleLove = function(projectId) {
  const loves = JSON.parse(localStorage.getItem(LOVE_KEY) || '[]');
  
  if (loves.includes(projectId)) {
    alert('You already loved this project');
    return;
  }
  
  loves.push(projectId);
  localStorage.setItem(LOVE_KEY, JSON.stringify(loves));
  
  const pRef = ref(db, `projects/${projectId}/loves`);
  get(pRef).then(snap => {
    const v = snap.val() || 0;
    set(pRef, v + 1);
    alert('Thank you for loving!');
  });
};

// ============ SMART DOWNLOAD FLOW ============
function smartDownloadFlow(smartLink, finalLink) {
  if (smartLink) {
    try {
      window.open(smartLink, '_blank');
    } catch (e) {}
  }
  
  processingPopup.classList.remove('hidden');
  let progress = 0;
  progressBar.style.width = '0%';
  
  const interval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress >= 100) {
      progress = 100;
      progressBar.style.width = '100%';
      clearInterval(interval);
      
      setTimeout(() => {
        processingPopup.classList.add('hidden');
        if (finalLink) window.open(finalLink, '_blank');
      }, 600);
    } else {
      progressBar.style.width = progress + '%';
    }
  }, 400);
}

// ============ SEARCH ============
function performSearch(query) {
  if (!query.trim()) {
    loadProjects();
    return;
  }
  
  const projectsRef = ref(db, 'projects');
  onValue(projectsRef, snap => {
    const data = snap.val() || {};
    const projects = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    
    const q = query.toLowerCase();
    const results = projects.filter(p => 
      (p.title || '').toLowerCase().includes(q) ||
      (p.shortDescription || '').toLowerCase().includes(q) ||
      (p.tags || '').toLowerCase().includes(q) ||
      (p.categoryName || '').toLowerCase().includes(q)
    );
    
    if (latestGrid) {
      latestGrid.innerHTML = results.length ? '' : '<p class="no-data">No results found</p>';
      results.forEach(p => latestGrid.appendChild(projectCard(p)));
    }
  }, { onlyOnce: true });
}

// ============ FILTER BY CATEGORY ============
function filterByCategory(catId, catName) {
  const projectsRef = ref(db, 'projects');
  onValue(projectsRef, snap => {
    const data = snap.val() || {};
    const projects = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    const filtered = projects.filter(p => p.categoryId === catId);
    
    if (latestGrid) {
      latestGrid.innerHTML = filtered.length ? '' : '<p class="no-data">No projects in this category</p>';
      filtered.forEach(p => latestGrid.appendChild(projectCard(p)));
    }
  }, { onlyOnce: true });
}

// ============ EVENT LISTENERS ============
if (searchBtn) searchBtn.onclick = () => performSearch(searchInput.value);
if (searchInput) searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') performSearch(searchInput.value);
});

if (btnSearch) btnSearch.onclick = () => alert('Search feature - enter query in search box');
if (btnCategories) btnCategories.onclick = () => document.getElementById('categories-section').scrollIntoView({ behavior: 'smooth' });

// ============ INIT ============
loadTechnologies();
loadCategories();
loadProjects();

// Expose for debugging
window.CS = { db, storage, performSearch, filterByCategory };