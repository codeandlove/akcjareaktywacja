import { VIEW_TYPE, DATE_FROM, DATE_TO, TOGGLE_RECENT_EVENTS } from '../actions/settings';

export function settings(state={}, action) {
    switch(action.type) {
        case VIEW_TYPE:
            return {
                ...state,
                view_type: action.payload
            };
        case DATE_FROM:
            return {
                ...state,
                date_from: action.payload
            };
        case DATE_TO:
            return {
                ...state,
                date_to: action.payload
            };
        case TOGGLE_RECENT_EVENTS:
            return {
                ...state,
                show_recent_events: action.payload
            }
        default:
            return state;
    }
}
