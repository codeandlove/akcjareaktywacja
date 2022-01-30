import {CLIENT_SET_DATA} from '../actions/client';

export function client(state={}, action) {
    switch(action.type) {
        case CLIENT_SET_DATA:
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}
