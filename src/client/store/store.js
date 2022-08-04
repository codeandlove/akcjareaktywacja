import firebase from "./../../firebase/firebase";
import "./../../firebase/database";

import { createStore, compose, applyMiddleware } from "redux";
import { reactReduxFirebase } from "react-redux-firebase";
import { routerMiddleware } from "react-router-redux";
import { createBrowserHistory } from "history";
import expireReducer from 'redux-persist-expire';

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import moment from "moment";

// import the root reducer
import rootReducer from "./../reducers";

import {firebaseConfig} from "./config";

const initialState = {
    settings: {
        view_type: "weeksView",
        date_from: moment().valueOf(),
        date_to: moment().add(6, "days").valueOf(),
        show_recent_events: true
    },
    client: {},
    map: null
};

const persistConfig = {
    key: 'root',
    storage: storage,
    debug: false,
    whitelist: ['event', 'client', 'settings'],
    transforms: [
        // Create a transformer by passing the reducer key and configuration. Values
        // shown below are the available configurations with default values
        expireReducer('settings', {
            expireSeconds: 3600 * 12,
            // (Optional) State to be used for resetting e.g. provide initial reducer state
            expiredState: initialState.settings,
            autoExpire: true

        })
        // You can add more `expireReducer` calls here for different reducers
        // that you may want to expire
    ]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create a history of your choosing (we're using a browser history in this case)
export const history = createBrowserHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

const composeEnhancers =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsDenylist, actionsCreators, serialize...
        })
        : compose;

// Add redux Firebase to compose
const createStoreWithFirebase = composeEnhancers(
    reactReduxFirebase(firebase, firebaseConfig),
    applyMiddleware(middleware)
)(createStore);

// Create store with reducers and initial state and persistence
export default () => {
    let store = createStoreWithFirebase(persistedReducer, initialState);
    let persistor = persistStore(store);
    return { store, persistor, history }
}

