import {setClientData}  from './client';
import {setDateFrom, setDateTo, setViewType, toggleRecentEvents}  from './settings';
import {setMap}  from './map';
import {addEvent, updateEvent, removeEvent}  from './event';
import {openPage, closePage, openSidebar, closeSidebar, expandSidebar, collapseSidebar, openMenu, closeMenu} from './layout';

export {
    setClientData,
    addEvent, updateEvent, removeEvent,
    setDateFrom, setDateTo, setViewType, toggleRecentEvents,
    openPage, closePage, openSidebar, closeSidebar, expandSidebar, collapseSidebar, openMenu, closeMenu,
    setMap
}
