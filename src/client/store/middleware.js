import {SIDEBAR_CLOSE} from "../actions/layout";
import { replace } from 'react-router-redux';

export const routingMiddleware = (store) => (next) => (action) => {
    if (action.type === SIDEBAR_CLOSE) {
        store.dispatch(replace("/"));
    }
    return next(action);
};