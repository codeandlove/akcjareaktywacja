import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import "firebase/analytics";
import "firebase/app-check";

import credentials from './credentials';

// Initialize Firebase
const app = firebase.initializeApp(credentials);
//
const appCheck = firebase.appCheck();

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
appCheck.activate(process.env.REACT_APP_RECAPTCHA_API_V3, true)

export const analytics = firebase.analytics(app);
export const auth = firebase.auth();

export default firebase;
