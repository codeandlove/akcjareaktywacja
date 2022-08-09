import { PAGE_OPEN, PAGE_CLOSE, SIDEBAR_OPEN, SIDEBAR_CLOSE, SIDEBAR_EXPAND, SIDEBAR_COLLAPSE, MENU_OPEN, MENU_CLOSE } from '../actions/layout';

export function layout(state= {}, action) {
    switch(action.type) {
        case PAGE_OPEN:
            return {
                ...state,
                pageIsOpen: true
            };
        case PAGE_CLOSE:
            return {
                ...state,
                pageIsOpen: false
            };
        case SIDEBAR_OPEN:
            return {
                ...state,
                sidebarIsOpen: true,
                pageIsOpen: false
            };
        case SIDEBAR_CLOSE:
            return {
                ...state,
                sidebarIsOpen: false
            };
        case SIDEBAR_EXPAND:
            return {
                ...state,
                sidebarIsExpanded: true
            };
        case SIDEBAR_COLLAPSE:
            return {
                ...state,
                sidebarIsExpanded: false
            };
        case MENU_OPEN:
            return {
                ...state,
                menuIsOpen: true
            };
        case MENU_CLOSE:
            return {
                ...state,
                menuIsOpen: false
            };
        default:
            return state;
    }
}
