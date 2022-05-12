import firebase from "./../../firebase/firebase";
import "./../../firebase/database";

import { createStore, compose, applyMiddleware } from "redux";
import { reactReduxFirebase } from "react-redux-firebase";

import moment from "moment";

import { routerMiddleware } from "react-router-redux";

import { createBrowserHistory } from "history";

// import the root reducer
import rootReducer from "./../reducers";

let loggedInUserUID = null;

// react-redux-firebase options
const config = {
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

// Create a history of your choosing (we're using a browser history in this case)
export const history = createBrowserHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

// Add redux Firebase to compose
const createStoreWithFirebase = compose(
    reactReduxFirebase(firebase, config),
    applyMiddleware(middleware)
)(createStore);

const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for (let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

//Cookies data
const cookieData = getCookie("data").length > 0 ? JSON.parse(getCookie("data")) : null;

const initialState = {
    settings: {
        view_type: !!cookieData ? cookieData.view_type : "weeksView",
        date_from: !!cookieData ? moment(cookieData.date_from) : moment(),
        date_to: !!cookieData ? moment(cookieData.date_to) : moment().add(6, "days"),
        show_recent_events: !!cookieData ? cookieData.show_recent_events : true
    },
    client: {
        ip: null
    },
    map: null
};

// Create store with reducers and initial state
export const store = createStoreWithFirebase(rootReducer, initialState);
