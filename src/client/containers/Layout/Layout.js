import React, {useEffect, useState} from "react";

import {Redirect} from "react-router";
import { Route, Switch } from "react-router-dom"

import EventsList from "../EventsList/EventsList";
import Chat from "./../Chat/Chat";
import EventForm from "./../EventForm/EventForm";
import Login from "./../Login/Login";
import Register from "./../Register/Register";
import Reset from "./../Reset/Reset";
import Account from "../Account/Account";
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
    SETTINGS, STATIC, UNAUTHORIZED,
    ACCOUNT,
    USERS, USER, MESSAGE, ACCOUNT_MESSAGES
} from "../../routers";
import {firebaseConnect, isLoaded} from "react-redux-firebase";
import {Dimmer, Loader} from "semantic-ui-react";
import {bindActionCreators, compose} from "redux";
import * as actionCreators from "../../actions";
import {connect} from "react-redux";
import Users from "../Users/Users";
import Unauthorized from "../Unauthorized/Unauthorized";
import User from "../User/User";
import UserChat from "../UserChat/UserChat";
import AccountMessagesDashboard from "../AccountMessagesDashboard/AccountMessagesDashboard";

const Layout = (props) => {
    const {auth, sidebarIsOpen, sidebarIsExpanded, pageIsOpen } = props;
    const [cssClass, setCssClass] = useState('');

    useEffect(() => {
        const sidebarClass = sidebarIsOpen ? "col-open": "";
        const sidebarExpandClass = sidebarIsExpanded ? "col-expand": "";
        const pageClass = pageIsOpen ? "page-open": "";

        setCssClass(`${sidebarClass} ${sidebarExpandClass} ${pageClass}`);

    }, [sidebarIsOpen, sidebarIsExpanded, pageIsOpen])

    if(!isLoaded(auth)) {
        return (
            <Dimmer active inverted>
                <Loader active size="large">Proszę czekać...</Loader>
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

    const sidebarRoutes = () => {
        return (
            <Switch>
                <Route exact path="/" render={() => <EventsList events={props.events} isExact={false} isMobile={props.isMobile}/> } />
                <Route exact path={`/${EVENT_FORM}`} render={() => <EventForm isMobile={props.isMobile} />} />
                <Route exact path={`/${ACTION}/${PREVIEW}`} render={() => <EventForm isMobile={props.isMobile} />} />
                <Route path={`/${EVENT_FORM}/:eventDate`} render={() => <EventForm isMobile={props.isMobile} />} />
                <Route path={`/${EVENTS_LIST}`} render={() => <EventsList events={props.events} isExact={true} isMobile={props.isMobile} />} />
                <Route path={`/${CHAT}`} render={() => <Chat data={props.chat} {...props} />} />
                <Route path={`/${USERS}`} render={() => isAuthorized(<Users />, `${UNAUTHORIZED}`)} />
                <Route path={`/${USER}/:userId`} render={(props) => isAuthorized(<User {...props}/>, `${UNAUTHORIZED}`)} />
                <Route path={`/${MESSAGE}/:messageId`} render={(props) => isAuthorized(<UserChat {...props}/>, `${UNAUTHORIZED}`)} />
                <Route path={`/${ACCOUNT_MESSAGES}`} render={(props) => isAuthorized(<AccountMessagesDashboard {...props}/>, `${UNAUTHORIZED}`)} />
                <Route path={`/${UNAUTHORIZED}`} render={() => <Unauthorized />} />
                <Route path={`/${LOGIN}`} render={() => <Login /> } />
                <Route path={`/${REGISTER}`} render={() => <Register /> } />
                <Route path={`/${RESET}`} render={() => <Reset /> } />
                <Route path={`/${ACCOUNT}`} render={() => isAuthorized(<Account />, `${LOGIN}`)} />
                <Route path="/*" render={() => <EventsList events={props.events} isExact={false} isMobile={props.isMobile} />} />
            </Switch>
        )
    }

    const pageRoutes = () => {
        return (
            <Switch>
                <Route exact path="/" render={() => null } />
                <Route exact path={`/${ACTION}/${PREVIEW}`} render={(props) => <EventPage {...props} isDraft={true}/> } />
                <Route path={`/${ACTION}/:slug`} render={(props) => <EventPage {...props}/> } />
                <Route path={`/${STATIC}/:slug`} render={(props) => <StaticPage {...props}/> } />
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
        <main className={cssClass} >
            <div className="col-wrapper">
                {sidebarRoutes()}
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

const mapStateToProps = state => {
    return {
        ...state.layout
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth, profile } }) => ({ auth, profile })),
    connect(mapStateToProps, mapDispatchToProps)
)(Layout);
