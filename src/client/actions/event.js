export const ADD_EVENT = `ADD_EVENT`;
export const REMOVE_EVENT = `REMOVE_EVENT`;
export const UPDATE_EVENT = `EDIT_EVENT`;

export function addEvent(payload) {
    return {
        type: ADD_EVENT,
        payload: payload
    }
}

export function updateEvent(payload) {
    return {
        type: ADD_EVENT,
        payload: payload
    }
}

export function removeEvent() {
    return {
        type: REMOVE_EVENT
    }
}
