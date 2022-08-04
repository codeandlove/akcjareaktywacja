import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';
import { settings } from './settings';
import { client } from './client';
import { map } from './map';
import { event } from './event';

import { routerReducer } from 'react-router-redux';

const rootReducer = combineReducers({
    firebase: firebaseReducer,
    routing: routerReducer,
    settings: settings,
    client,
    event,
    map
});

export default rootReducer;
