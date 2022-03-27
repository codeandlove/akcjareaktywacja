import firebase from "./firebase";
import {app} from './firebase';
import "firebase/analytics";

export const analytics = firebase.analytics(app);

export default analytics;