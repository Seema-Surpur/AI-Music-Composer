import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import type { GeneratedTrack } from '../engine/musicEngine';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'ai-music-composer-demo',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'ai-music-composer-demo.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123:web:abc',
};

// Init once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// ─── AUTH ───────────────────────────────────────────────
export async function signUp(email: string, password: string, displayName: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─── CLOUD TRACKS ────────────────────────────────────────
export interface CloudTrack {
  id: string;
  uid: string;
  name: string;
  mood: string;
  style: string;
  tempo: number;
  duration: number;
  createdAt: string;
  midiUrl?: string;
}

export async function saveTrackToCloud(
  track: GeneratedTrack,
  uid: string,
  midiBlob: Blob | null
): Promise<CloudTrack | null> {
  try {
    const trackData: Omit<CloudTrack, 'id'> = {
      uid,
      name: track.name,
      mood: track.config.mood,
      style: track.config.style,
      tempo: track.config.tempo,
      duration: track.duration,
      createdAt: new Date().toISOString(),
    };

    if (midiBlob) {
      const storageRef = ref(storage, `users/${uid}/tracks/${track.id}.mid`);
      await uploadBytes(storageRef, midiBlob);
      trackData.midiUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(collection(db, 'tracks'), trackData);
    return { id: docRef.id, ...trackData };
  } catch (e) {
    console.error('saveTrackToCloud error:', e);
    return null;
  }
}

export async function getUserTracks(uid: string): Promise<CloudTrack[]> {
  try {
    const q = query(
      collection(db, 'tracks'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CloudTrack));
  } catch (e) {
    console.error('getUserTracks error:', e);
    return [];
  }
}

export async function deleteCloudTrack(id: string, uid: string, midiUrl?: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'tracks', id));
    if (midiUrl) {
      const storageRef = ref(storage, midiUrl);
      await deleteObject(storageRef).catch(() => {});
    }
    return true;
  } catch {
    return false;
  }
}
