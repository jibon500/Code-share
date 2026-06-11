// Comments system (client-side) - uses Realtime Database
import firebaseConfig from '../firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, push, onValue, remove, update } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function postComment(projectId, name, comment){
  const cRef = ref(db, `comments/${projectId}`);
  return push(cRef, { name, comment, createdAt: Date.now(), approved: false });
}

export function listenComments(projectId, cb){
  const cRef = ref(db, `comments/${projectId}`);
  onValue(cRef, snap=>{ cb(snap.val() || {}); });
}

export function approveComment(projectId, commentKey){
  return update(ref(db, `comments/${projectId}/${commentKey}`), { approved: true });
}

export function deleteComment(projectId, commentKey){
  return remove(ref(db, `comments/${projectId}/${commentKey}`));
}
