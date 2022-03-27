import firebase from "./firebase";
import 'firebase/messaging';

let messaging = null,
    browserSupport = firebase.messaging.isSupported();

if (browserSupport) {
    messaging = firebase.messaging();
}

const getMessagesToken = () => {
    if(!browserSupport) return;

    messaging.getToken({
        vapidKey: process.env.REACT_APP_NOTIFICATION_VAPID_KEY
    }).then((currentToken) => {
        if (currentToken) {
            // console.log(currentToken);
            subscribeTokenToTopic(currentToken, 'events');
            subscribeTokenToTopic(currentToken, 'chat');
            //console.log('Token Received.');
        } else {
            // Show permission request.
            console.log('No Instance ID token available. Request permission to generate one.');
        }
    }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
    });

    const FCM_SERVER_KEY =  process.env.REACT_APP_NOTIFICATION_SERVER_KEY;

    const subscribeTokenToTopic = (token, topic) => {
        fetch(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`, {
            method: 'POST',
            headers: new Headers({
                Authorization: `key=${FCM_SERVER_KEY}`
            })
        })
            .then((response) => {
                if (response.status < 200 || response.status >= 400) {
                    console.log(response.status, response);
                }
                //console.log(`"${topic}" is subscribed`);
            })
            .catch((error) => {
                console.error(error.result);
            });
        return true;
    }
}

export const askForPermissionToReceiveNotifications = async () => {
    if(process.env.NODE_ENV !== 'production' && !browserSupport) {
        return;
    }

    try {
        await Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
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