import { UPDATE_EVENT_DRAFT, REMOVE_EVENT } from '../actions/event';

export function draft(state= {}, action) {
    switch(action.type) {
        case UPDATE_EVENT_DRAFT :
            return {
                ...state,
                draft: action.payload
            };
        case REMOVE_EVENT :
            return {
                ...state,
                draft: {}
            };
        default:
            return state;
    }
}
