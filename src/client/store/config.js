import firebase from "../../firebase/firebase";

let loggedInUserUID = null;

export const firebaseConfig = {
    userProfile: "users", // saves user profiles to "/users" on Firebase
    // presence: 'presence', // where list of online users is stored in database
    // sessions: 'sessions', // where list of user sessions is stored in database (presence must be enabled)
    chat: "chat",
    events: "events",
    recent: "events",
    online: "online",
    preserveOnLogout: ["events", "chat", "users", "recent", "online"],
    enableLogging: false, // enable/disable Firebase"s database logging,
    onAuthStateChanged: async (userData) => {
        if(userData) {
            if(!userData.isAnonymous) {
                const {uid} = userData;
                const userRef = firebase.database().ref(`/users/${uid}`).child('status');
                loggedInUserUID = uid;

                userRef.once("value").then( async () => {
                    await userRef.set('online');
                });

                await userRef.once('value', async snapshot => {
                    if (snapshot.exists()) {
                        await userRef.onDisconnect().set('offline');
                    }
                })
            }
        } else {
            if (loggedInUserUID) {
                firebase.auth().signInAnonymously().then(() => {
                    const userRef = firebase.database().ref(`/users/${loggedInUserUID}`).child('status');

                    userRef.once("value").then(async () => {
                        await userRef.set('offline');
                    });

                    loggedInUserUID = null;
                });
            }
        }
    }
};
