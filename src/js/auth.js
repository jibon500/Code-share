// Auth helpers for admin and first-admin flow
import firebaseConfig from '../firebase/config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export async function createFirstAdmin(email, password, displayName){
  // Create a Firebase Auth user, then mark under /admins/{uid}: true
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;
  await set(ref(db, `admins/${uid}`), { email, displayName: displayName || email, createdAt: Date.now() });
  return uid;
}

export function login(email, password){
  return signInWithEmailAndPassword(auth, email, password);
}
export function logout(){
  return signOut(auth);
}

export function onAuth(cb){
  return onAuthStateChanged(auth, cb);
}

export async function isFirstAdminExists(){
  const adminsRef = ref(db, 'admins');
  const snap = await get(adminsRef);
  const data = snap.val();
  return data && Object.keys(data).length > 0;
}
