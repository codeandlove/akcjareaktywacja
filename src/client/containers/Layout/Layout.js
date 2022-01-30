import React from "react";

import { Redirect } from "react-router";
import { Route, Switch } from "react-router-dom"

import EventsList from "../EventsList/EventsList";
import Chat from "./../Chat/Chat";
import EventForm from "./../EventForm/EventForm";
import Login from "./../Login/Login";
import Register from "./../Register/Register";
import Reset from "./../Reset/Reset";
import User from "./../User/User";
import EventPage from "./../EventPage/EventPage";
import Settings from "../Settings/Settings";

import "./Layout.scss";
import StaticPage from "../StaticPage/StaticPage";
import {
    ACTION,
    CHAT,
    EVENT_FORM,
    EVENTS_LIST,
    LOGIN,
    PREVIEW,
    REGISTER,
    RESET,
    SETTINGS, STATIC,
    USER
} from "../../routers";
import {isLoaded} from "react-redux-firebase";
import {Dimmer, Loader} from "semantic-ui-react";

const Layout = (props) => {
    const {auth} = props;

    if(!isLoaded(auth)) {
        return (
            <Dimmer active inverted>
                <Loader size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    const isAuthorized = (component, route) =>{
        const { auth } = props;

        if(!auth) {
            return null;
        }

        if(!auth.isEmpty && !auth.isAnonymous) {
            return component;
        } else {
            return <Redirect to={route} />
        }
    }

    const cssClass = () => {

        const { isColOpen, isColExpanded, isPageOpen } = props;

        const colClass = (isColOpen) ? "col-open": "";

        const colExpandClass = (isColExpanded) ? "col-expand": "";

        const pageClass = (isPageOpen) ? "page-open": "";

        return `${colClass} ${colExpandClass} ${pageClass}`;
    }

    const colRoutes = () => {
        const eventList = <EventsList events={props.events} close={props.colClose} isMobile={props.isMobile} viewEvent={key => props.viewEvent(key)} toggleSettings={props.toggleSettings} toggleColumn={props.toggleColumn} />;
        return (
            <Switch>
                <Route exact path="/" render={() => eventList } />
                <Route exact path={`/${EVENT_FORM}`} render={() => <EventForm coordinates={(!!props.event) ? props.event.coordinates : null} cancel={props.formCancel} toggleColExpand={props.toggleColExpand} toggleColumn={props.toggleColumn} isColExpanded={props.isColExpanded} saveEvent={val => props.saveEvent(val)} updateEvent={val => props.updateEvent(val)} /> } />
                <Route exact path={`/${ACTION}/${PREVIEW}`} render={() => <EventForm cancel={props.formCancel} toggleColExpand={props.toggleColExpand} toggleColumn={props.toggleColumn} isColExpanded={props.isColExpanded} saveEvent={val => props.saveEvent(val)} updateEvent={val => props.updateEvent(val)} /> } />
                <Route path={`/${EVENT_FORM}/:eventDate`} render={({match}) => <EventForm {...match} coordinates={(!!props.event) ? props.event.coordinates : null} cancel={props.formCancel} toggleColExpand={props.toggleColExpand} toggleColumn={props.toggleColumn} isColExpanded={props.isColExpanded} saveEvent={val => props.saveEvent(val)} updateEvent={val => props.updateEvent(val)} /> } />
                <Route path={`/${EVENTS_LIST}`} render={() => eventList } />
                <Route path={`/${CHAT}`} render={() => <Chat data={props.chat} close={props.colClose} {...props} />} />
                <Route path={`/${LOGIN}`} render={() => <Login close={props.colClose} toggleColumn={props.toggleColumn}/> } />
                <Route path={`/${REGISTER}`} render={() => <Register close={props.colClose} toggleColumn={props.toggleColumn}/> } />
                <Route path={`/${RESET}`} render={() => <Reset close={props.colClose} toggleColumn={props.toggleColumn}/> } />
                <Route path={`/${USER}`} render={() => isAuthorized(<User close={props.colClose} toggleColumn={props.toggleColumn} />, `${LOGIN}`)} />
                <Route path="/*" render={() => eventList } />
            </Switch>
        )
    }

    const pageRoutes = () => {
        const { pageClose, pageOpen } = props;
        return (
            <Switch>
                <Route exact path="/" render={() => null } />
                <Route exact path={`/${ACTION}/${PREVIEW}`} render={(props) => <EventPage {...props} isDraft={true} close={pageClose} open={pageOpen} /> } />
                <Route path={`/${ACTION}/:slug`} render={(props) => <EventPage {...props} close={pageClose} open={pageOpen} /> } />
                <Route path={`/${STATIC}/:slug`} render={(props) => <StaticPage {...props} close={pageClose} open={pageOpen} /> } />
            </Switch>
        )
    }

    const additionalRoutes = () => {
        return (
            <Switch>
                <Route exact path={`/${SETTINGS}`} render={(props) => <Settings {...props} />} />
            </Switch>
        )
    }

    return (
        <main className={cssClass()} >
            <div className="col-wrapper">
                {colRoutes()}
            </div>
            <div className="map-wrapper">
                {props.children}
            </div>
            <div className="page-wrapper">
                {pageRoutes()}
            </div>
            {additionalRoutes()}
        </main>
    )
};

export default Layout;