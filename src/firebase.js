import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import "firebase/analytics";
import "firebase/app-check";

import credentials from './credentials';

// Initialize Firebase
const app = firebase.initializeApp(credentials);
export const analytics = firebase.analytics(app);

export const auth = firebase.auth();

if(process.env.NODE_ENV === 'production') {
    const appCheck = firebase.appCheck();
    // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
    // key is the counterpart to the secret key you set in the Firebase console.
    appCheck.activate(
        process.env.REACT_APP_RECAPTCHA_API_V3,

        // Optional argument. If true, the SDK automatically refreshes App Check
        // tokens as needed.
        true
    );

    appCheck.setTokenAutoRefreshEnabled(true);
}

export default firebase;

