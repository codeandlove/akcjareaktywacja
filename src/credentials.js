const {decrypt} = require('./../utils');

const apiKey = decrypt(process.env.REACT_APP_FIREBASEAPI_KEY, process.env);

export const dev = {
    apiKey: apiKey,
    authDomain: "akcjareaktywacja-dev.firebaseapp.com",
    databaseURL: "https://akcjareaktywacja-dev-default-rtdb.firebaseio.com",
    projectId: "akcjareaktywacja-dev",
    storageBucket: "akcjareaktywacja-dev.appspot.com",
    messagingSenderId: "717290649510",
    appId: "1:717290649510:web:c4f6c198254b43b4aa0167",
    measurementId: "G-T025PTD7Y0"
}

export const prod = {
    apiKey: apiKey,
    authDomain: "akcjareaktywacja-39acb.firebaseapp.com",
    databaseURL: "https://akcjareaktywacja-39acb.firebaseio.com",
    projectId: "akcjareaktywacja-39acb",
    storageBucket: "akcjareaktywacja-39acb.appspot.com",
    messagingSenderId: "951885335245",
    appId: "1:951885335245:web:52b54d3238fa27e6",
    measurementId: "G-8JY9X653ZY"
}

export default process.env.NODE_ENV === 'development' ? dev : prod;