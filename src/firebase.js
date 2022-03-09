import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/messaging';
import "firebase/analytics";
import "firebase/app-check";

import credentials from './credentials';

// Initialize Firebase
const app = firebase.initializeApp(credentials);

const appCheck = firebase.appCheck();

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
appCheck.activate(process.env.REACT_APP_RECAPTCHA_API_V3, true)

export const analytics = firebase.analytics(app);
export const auth = firebase.auth();

let messaging = null;

if (firebase.messaging.isSupported()) {
    console.log('Browser does support web push api.');
    messaging = firebase.messaging();
}

const getMessagesToken = () => {
    if(!messaging) return;

    messaging.getToken({
        vapidKey: 'BAE3npwkOAaX-wQs3QsrW0ikBBclhIv3_nKfm8p6VO2YveN8kZjykaIEt63No5LKQL-R2DK3WMaW2MWpS9bCH3E'
    }).then((currentToken) => {
        if (currentToken) {
            //console.log(currentToken);
            console.log('Token Received.');
        } else {
            // Show permission request.
            console.log('No Instance ID token available. Request permission to generate one.');
        }
    }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);

        if(err.code === 'messaging/token-unsubscribe-failed') {
            getMessagesToken()
        }
    });
}

export const askForPermissionToReceiveNotifications = async () => {
    if(process.env.NODE_ENV === 'production') {
        return;
    }

    try {
        await Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/firebase-messaging-sw.js`)
                        .then(function(registration) {
                            console.log('Registration successful, scope is:', registration.scope);
                        }).catch(function(err) {
                        console.log('Service worker registration failed, error:', err);
                    });
                }

                console.log('Notification permission granted.');

                getMessagesToken();

            } else {
                console.log('Unable to get permission to notify.');
            }
        });

    } catch (error) {
        console.error(error);
    }
}

export default firebase;
