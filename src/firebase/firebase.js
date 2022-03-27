import firebase from 'firebase/app';
import credentials from './credentials';

// Initialize Firebase
export const app = firebase.initializeApp(credentials);

export default firebase;