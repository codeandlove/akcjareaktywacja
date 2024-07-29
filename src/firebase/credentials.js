export const dev = {
    apiKey: process.env.REACT_APP_FIREBASEAPI_KEY,
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
}

export const prod = {
    apiKey: process.env.REACT_APP_FIREBASEAPI_KEY,
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
}

export default process.env.NODE_ENV === 'development' ? dev : prod;
