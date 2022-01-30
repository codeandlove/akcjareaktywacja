import { MAP } from '../actions/map';

export function map(state={}, action) {
    switch(action.type) {
        case MAP:
            return {
                ...state,
                map: action.payload
            };
        default:
            return state;
    }
}
