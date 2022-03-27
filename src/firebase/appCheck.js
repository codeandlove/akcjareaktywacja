import firebase from "./firebase";
import "firebase/app-check";

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.

export const verifyAppCheck = async () => {
    const appCheck = firebase.appCheck();
    appCheck.activate(process.env.REACT_APP_RECAPTCHA_API_V3, true)

    return await appCheck.getToken(false)
        .then((token) => {
            return token;
        })
        .catch(error => {
            console.log(error);
        })
}
