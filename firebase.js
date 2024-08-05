import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAng-0TzFi6px9fkDVz1IEJywWAQXqZ9UA',
  authDomain: 'inventory-managment-19a16.firebaseapp.com',
  projectId: 'inventory-managment-19a16',
  storageBucket: 'inventory-managment-19a16.appspot.com',
  messagingSenderId: '772960760584',
  appId: '1:772960760584:web:3fb8ecabc1639e4d31f2bd',
  measurementId: 'G-K3QXY24W7L',
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };