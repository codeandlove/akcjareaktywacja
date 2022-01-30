export const SETTINGS = 'Settings';
export const DATE_FROM = `${SETTINGS}/DATE_FROM`;
export const DATE_TO = `${SETTINGS}/DATE_TO`;
export const VIEW_TYPE = `${SETTINGS}/VIEW_TYPE`;
export const CONFIG = 'CONFIG';
export const TOGGLE_RECENT_EVENTS = `${CONFIG}/TOGGLE_RECENT_EVENTS`;

export function setDateFrom(value) {
    return {
        type: DATE_FROM,
        payload: value
    }
}

export function setDateTo(value) {
    return {
        type: DATE_TO,
        payload: value
    }
}

export function setViewType(value) {
    return {
        type: VIEW_TYPE,
        payload: value
    }
}

export function toggleRecentEvents(value) {
    return {
        type: TOGGLE_RECENT_EVENTS,
        payload: value
    }
}
