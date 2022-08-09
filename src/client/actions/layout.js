export const PAGE_OPEN = `PAGE_OPEN`;
export const PAGE_CLOSE = `PAGE_CLOSE`;
export const SIDEBAR_OPEN = `SIDEBAR_OPEN`;
export const SIDEBAR_CLOSE = `SIDEBAR_CLOSE`;
export const SIDEBAR_EXPAND = `SIDEBAR_EXPAND`;
export const SIDEBAR_COLLAPSE = `SIDEBAR_COLLAPSE`;
export const MENU_OPEN = `MENU_OPEN`;
export const MENU_CLOSE = `MENU_CLOSE`;

export function openPage() {
    return {
        type: PAGE_OPEN
    }
}

export function closePage() {
    return {
        type: PAGE_CLOSE
    }
}

export function openSidebar() {
    return {
        type: SIDEBAR_OPEN
    }
}

export function closeSidebar() {
    return {
        type: SIDEBAR_CLOSE
    }
}

export function expandSidebar() {
    return {
        type: SIDEBAR_EXPAND
    }
}

export function collapseSidebar() {
    return {
        type: SIDEBAR_COLLAPSE
    }
}

export function openMenu() {
    return {
        type: MENU_OPEN
    }
}

export function closeMenu() {
    return {
        type: MENU_CLOSE
    }
}