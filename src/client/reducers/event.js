import { ADD_EVENT, UPDATE_EVENT, REMOVE_EVENT } from '../actions/event';

export function event(state= {}, action) {
    switch(action.type) {
        case ADD_EVENT :
            return {
                ...state,
                ...action.payload
            };
        case UPDATE_EVENT :
            return {...state.event, ...action.payload};
        case REMOVE_EVENT :
            return {};
        default:
            return state;
    }
}
