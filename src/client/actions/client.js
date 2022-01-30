export const CLIENT = 'CLIENT';
export const CLIENT_SET_DATA = `${CLIENT}/SET_DATA`;

export function setClientData(value) {
    return {
        type: CLIENT_SET_DATA,
        payload: value
    }
}