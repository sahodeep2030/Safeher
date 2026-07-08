import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  !!firebaseConfig.projectId &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app;
let auth: any = null;
let db: any = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully with config.");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase config keys are missing or placeholders. SafeHer is running in mockup/in-memory mode.");
}

// Initial reports to seed if Firestore incidents collection is empty
const initialReportsSeed = [
  {
    type: 'poor-lighting',
    description: 'Sector 4 Metro Underpass is completely dark. The high-mast light bulb is broken. Avoid walking alone after 8 PM.',
    dateTime: 'Reported 2 hours ago',
    locationName: 'Sector 4 Metro Underpass Link',
    coordinates: { x: 0.58, y: 0.55 },
    isAnonymous: true,
    status: 'verified',
    reporter: 'Anonymous Guardian',
    upvotes: 42
  },
  {
    type: 'harassment',
    description: 'Two men loitering near the construction site gate. Making passing comments at female walkers. Police booth is 1km away.',
    dateTime: 'Reported 5 hours ago',
    locationName: 'Outer Ring Bypass Construction Site',
    coordinates: { x: 0.28, y: 0.42 },
    isAnonymous: false,
    status: 'verified',
    reporter: 'Ritu Sen',
    upvotes: 28
  },
  {
    type: 'theft',
    description: 'Two-wheeler chain snatching incident reported near the park exit. Poor patrolling in this sector after dark.',
    dateTime: 'Reported Yesterday',
    locationName: 'Vikas Public Park Gate 3',
    coordinates: { x: 0.82, y: 0.75 },
    isAnonymous: true,
    status: 'resolved',
    reporter: 'Anonymous Member',
    upvotes: 56
  },
  {
    type: 'safe-zone',
    description: '24/7 market cluster. Extremely safe with 3 active security guards and high-footfall grocery stores open all night.',
    dateTime: 'Reported 2 days ago',
    locationName: 'Safe Zone C (Palam Market Cluster)',
    coordinates: { x: 0.62, y: 0.8 },
    isAnonymous: false,
    status: 'verified',
    reporter: 'Neha Malhotra',
    upvotes: 89
  }
];

export async function seedInitialData() {
  if (!db) return;
  try {
    const querySnapshot = await getDocs(collection(db, 'incidents'));
    if (querySnapshot.empty) {
      console.log('Seeding initial incident data to Firestore...');
      const batch = writeBatch(db);
      initialReportsSeed.forEach((report) => {
        const docRef = doc(collection(db, 'incidents'));
        batch.set(docRef, report);
      });
      await batch.commit();
      console.log('Seeding finished successfully.');
    }
  } catch (error) {
    console.error('Failed to seed initial Firestore data:', error);
  }
}

export { auth, db, isConfigured };
