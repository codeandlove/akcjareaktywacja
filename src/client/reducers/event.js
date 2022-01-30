import {ADD_EVENT, EDIT_EVENT, UPDATE_EVENT_DRAFT, REMOVE_EVENT} from '../actions/event';

export function event(state= {}, action) {
    switch(action.type) {
        case ADD_EVENT :
            return {
                ...state,
                event: action.payload
            };
        case EDIT_EVENT :
            return {
                ...state,
                event: {...state.event, ...action.payload}
            };
        case REMOVE_EVENT :
            return {
                ...state,
                event: {}
            };
        default:
            return state;
    }
}
