import React, {Component, useEffect, useState} from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import { compose } from "redux";
import { firebaseConnect, isEmpty, isLoaded, populate } from "react-redux-firebase";
import { Link } from "react-router-dom";

import moment from "moment";

import logo from "./../../../assets/logo.svg";
import picture from "./../../../assets/picture.webp";

import Layout from "./../Layout/Layout";
import Map from "./../Map/Map";
import {CHAT_LATEST_KEY_COOKIE_NAME} from "../Chat/Chat";

import {Sidebar, Menu, Icon, Popup, Dropdown, Dimmer, Loader} from "semantic-ui-react";

import "./App.scss";
import ChatSnipped from "../ChatSnipped/ChatSnipped";
import SecureLS from "secure-ls";

import {formatSlackNotifyMessage, generateClientDeviceUUID, getIPInfoApiUrl, notifyToSlackChannel} from "../../utils";

import {bindActionCreators} from "redux";
import * as actionCreators from "../../actions";
import {
    CHAT,
    CONTACT,
    EVENT_FORM,
    EVENTS_LIST,
    GDPR, LOGIN,
    PRIVACY_POLICY,
    STATIC,
    TERMS_OF_USE,
    USER
} from "../../routers";
import Avatar from "../../components/Avatar/Avatar";
import DotCounter from "../../components/DotCounter/DotCounter";
import {withCookies} from "react-cookie";
import {askForPermissionToReceiveNotifications} from "../../../firebase/messaging";
import {SLACK_NEW_VISITOR_HOOK} from "../../consts";
import VisitorsOnlineTracker from "../../components/VisitorsOnlineTracker/VisitorsOnlineTracker";
import {withRouter} from "react-router";

const populates = [
    { child: "participants", root: "users", keyProp: "uid" },
    { child: "user", root: "users", keyProp: "uid" },
    { child: "avatarImage", root: "users", keyProp: "avatarImage" },
    { child: "status", root: "users", keyProp: "status"}
];

const ls = new SecureLS();

const toFloatNumber = (str, val) => {
    str = str.toString();
    str = str.slice(0, (str.indexOf(".")) + val + 1);
    return Number(str);
}

const App = (props) => {
    const {setClientData, history, firebase, events, recent, chat, auth, profile, cookies} = props;

    const [isMobile, setIsMobile] = useState(false);
    const [isPageOpen, setIsPageOpen] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isColOpen, setIsColOpen] = useState(window.innerWidth > 768);
    const [isColExpanded, setIsColExpanded] = useState(false);
    const [event, setEvent] = useState(null);
    const [eventKey, setEventKey] = useState(null);

    useEffect(async () => {
        isMobileDetection();

        window.addEventListener('resize', isMobileDetection);

        setTimeout(async () => {
            await askForPermissionToReceiveNotifications();
        }, 15000)

        const clientData =  ls.get('clientDetails');

        try {
            if(clientData) {
                setClientData(clientData);

                if (process.env.NODE_ENV === 'production') {
                    notifyToSlackChannel(SLACK_NEW_VISITOR_HOOK,
                        {
                            "text": "Returning Visitor.",
                            "blocks": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "mrkdwn",
                                        "text": `${formatSlackNotifyMessage(clientData)}`
                                    }
                                }
                            ]
                        }
                    );
                }

                return;
            }

            await fetch(getIPInfoApiUrl()).then((response) => response.json()).then((jsonResponse) => {
                const {loc} = jsonResponse;
                let defaultCoordinates = null;
                let clientData = jsonResponse;

                if(loc) {
                    defaultCoordinates = {
                        lat: toFloatNumber(loc.split(',')[0], 4),
                        lng: toFloatNumber(loc.split(',')[1], 4)
                    }
                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        defaultCoordinates = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }

                        clientData = {...clientData, ...{
                                defaultCoordinates: defaultCoordinates
                            }}

                        setClientData(clientData);

                        ls.set('clientDetails', clientData);
                    });
                }

                clientData = {...clientData, ...{
                        defaultCoordinates: defaultCoordinates,
                        duuid: generateClientDeviceUUID()
                    }};

                setClientData(clientData);

                notifyToSlackChannel(SLACK_NEW_VISITOR_HOOK,
                    {
                        "text": "New Visitor.",
                        "blocks": [
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": `${formatSlackNotifyMessage(jsonResponse)}`
                                }
                            }
                        ]
                    }
                );

                ls.set('clientDetails', clientData);
            });
        } catch (error) {
            console.log(error);
        }

        return window.removeEventListener('resize', isMobileDetection);
    }, []);

    const isMobileDetection = () => {
        setIsMobile(window.innerWidth <= 768)
    }

    const toggleMenu = (toggle) => {
        setIsMenuVisible(state => {
            return !toggle ? toggle : !state
        });
    };

    const toggleColExpanded = () => {
        setIsColExpanded(state => {
            return !state
        })
    };

    const togglePage = (toggle) => {
        setIsMenuVisible(false);
        setIsPageOpen(toggle);
        setEventKey(state => {
            return !toggle ? null : state
        });
    };

    const toggleColumn = toggle => {
        setIsMenuVisible(false);
        setIsColExpanded(false);
        setIsColOpen(toggle);

        togglePage(false);

        if(!toggle) {
            history.replace("/");
        }
    };

    const updateEvent = data => {
        setEvent(state => {
            return {...state, ...data}
        });
    };

    const openEventForm = data => {
        const {lat, lng} = data;

        setIsColOpen(true);
        setIsColExpanded(false);
        setEvent( {
            coordinates: {
                lat: lat,
                lng: lng
            }
        })

        history.replace(`/${EVENT_FORM}`);
    };

    const closeEventForm = () => {
        setIsColOpen(false);
        setIsColExpanded(false);
        setEvent(null);

        history.push("/");

        localStorage.removeItem("eventDraft")
    };

    const handleSaveEvent = data => {
        firebase.push("events", data).then(() => {
            setEvent(null);
            setIsColExpanded(false);

            history.push("/");
        });
    };

    const openChat = () => {
        toggleColumn(true);
        history.push(`/${CHAT}`);
    }

    const dropdownTrigger = (
        <>
            {
                !isEmpty(auth) && !auth.isAnonymous ? <Avatar size="mini" /> : <></>
            }
            {
                !isMobile ? `Witaj, ${profile.displayNick || 'dodaj swój nick!'}` : <></>
            }
        </>
    )

    const lastKey = cookies.get(CHAT_LATEST_KEY_COOKIE_NAME);

    const sharedState = {
        isPageOpen: isPageOpen,
        isColOpen: isColOpen,
        isColExpanded: isColExpanded,
        event: event,
        eventKey: eventKey
    }

    return (
        <div className="app">
            <Menu borderless>
                <Menu.Item
                    onClick={toggleMenu}
                >
                    <Icon name="bars" className="have-dot">
                        <DotCounter data={chat} lastKey={lastKey}/>
                    </Icon>
                </Menu.Item>
                <Menu.Item
                    header
                    className="logo-item"
                    as={Link}
                    to={`/`}
                    onClick={() => togglePage(false)}
                >
                    <img src={logo} className="logo" alt="Akcjareaktywacja.pl" title="Akcjareaktywacja.pl" width="176" height="19" />
                    <VisitorsOnlineTracker />
                </Menu.Item>
                <Menu.Menu position="right">
                    {
                        isMobile ? (
                            <div className="picture-logo">
                                <img src={picture} className="picture-img" alt="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." title="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." />
                            </div>
                        ) : (
                            <Popup
                                trigger={
                                    <div className="picture-logo">
                                        <img src={picture} className="picture-img" alt="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." title="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." />
                                    </div>
                                }
                                content="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo."
                                position="bottom center"
                            />
                        )
                    }
                    {
                        <>
                            <Menu.Item
                                key="add-event-form-nav"
                                className="add-event-item"
                                name="addEvent"
                                as={Link}
                                to={`/${EVENT_FORM}`}
                                onClick={() => toggleColumn(true)}
                            >
                                <Icon name="plus circle" size="large" color="olive" />
                                <span>Dodaj wydarzenie</span>
                            </Menu.Item>
                            {
                                isEmpty(auth) || auth.isAnonymous ? (
                                    <Menu.Item
                                        key="user-login-nav"
                                        className="login-item"
                                        name="login"
                                        as={Link}
                                        to={`/${LOGIN}`}
                                        onClick={() => toggleColumn(true)}
                                    >
                                        <Icon name="user circle" size="large" color="olive" />
                                        <span>Logowanie</span>
                                    </Menu.Item>
                                ) : (
                                    <Menu.Item
                                        key="user-area-nav"
                                        className="logout-item"
                                        name="logout"
                                    >
                                        <Dropdown trigger={dropdownTrigger} >
                                            <Dropdown.Menu>
                                                <Dropdown.Item text="Twój profil"
                                                   as={Link}
                                                   to={`/${USER}`}
                                                   onClick={() => toggleColumn(true)}
                                                />
                                                <Dropdown.Item text="Wyloguj"
                                                   as={Link}
                                                   to="/"
                                                   onClick={() => firebase.logout()}
                                                />
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Menu.Item>
                                )
                            }
                        </>
                    }
                </Menu.Menu>
            </Menu>
            <Sidebar.Pushable>
                <Sidebar
                    as={Menu}
                    className="sidebar-left"
                    animation="push"
                    width="thin"
                    direction="left"
                    visible={isMenuVisible}
                    icon="labeled"
                    vertical
                >
                    <Menu.Item
                        name="events"
                        as={Link}
                        to={`/${EVENTS_LIST}`}
                        onClick={() => toggleColumn(true)}
                    >
                        <Icon name="calendar" className="alternate outline" />
                        Wydarzenia
                    </Menu.Item>
                    <Menu.Item
                        name="chat"
                        as={Link}
                        to={`/${CHAT}`}
                        onClick={() => toggleColumn(true)}
                    >
                        <Icon name="comments" className="outline have-dot">
                            <DotCounter data={chat} lastKey={lastKey}/>
                        </Icon>
                        Chat
                    </Menu.Item>
                    <Dropdown item text="Pomoc" pointing="left" icon="help" className="dropdown-menu">
                        <Dropdown.Menu>
                            <Dropdown.Item
                                as={Link}
                                to={`/${STATIC}/${TERMS_OF_USE}`}
                                onClick={() => toggleColumn(true)}
                            >
                                Regulamin
                            </Dropdown.Item>
                            <Dropdown.Item
                                as={Link}
                                to={`/${STATIC}/${GDPR}`}
                                onClick={() => toggleColumn(true)}
                            >
                                RODO
                            </Dropdown.Item>
                            <Dropdown.Item
                                as={Link}
                                to={`/${STATIC}/${PRIVACY_POLICY}`}
                                onClick={() => toggleColumn(true)}
                            >
                                Prywatność
                            </Dropdown.Item>
                            <Dropdown.Item
                                as={Link}
                                to={`/${STATIC}/${CONTACT}`}
                                onClick={() => toggleColumn(true)}
                            >
                                Kontakt
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Sidebar>
                <Sidebar.Pusher>
                    <Sidebar.Pushable onClick={() => toggleMenu(false)}>
                        <ChatSnipped
                            {
                                ...sharedState
                            }
                            data={chat}
                            openChat={openChat}
                        />
                        <Layout
                            {
                                ...sharedState
                            }
                            auth={auth}
                            events={events}
                            recent={recent}
                            chat={chat}
                            isMobile={isMobile}
                            colClose={() => toggleColumn(false)}
                            pageClose={() => togglePage(false)}
                            pageOpen={() => togglePage(true)}
                            toggleColExpand={toggleColExpanded}
                            toggleColumn={data => toggleColumn(data)}
                            formCancel={closeEventForm}
                            saveEvent={data => handleSaveEvent(data)}
                            updateEvent={data => updateEvent(data)}
                            //toggleSettings={toggleSettings}
                        >
                            {
                                !isLoaded(events) ? (
                                    <Dimmer active>
                                        <Loader size="large">Proszę czekać...</Loader>
                                    </Dimmer>
                                ) : (
                                    <Map
                                        {
                                            ...sharedState
                                        }
                                        events={events}
                                        recent={recent}
                                        event={event}
                                        addEvent={data => openEventForm(data)}
                                        updateEvent={data => updateEvent(data)}
                                        //viewEvent={key => viewEvent(key)}
                                        cancelEvent={closeEventForm}
                                    />
                                )

                            }
                        </Layout>
                    </Sidebar.Pushable>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        </div>
    );
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

const enhance = compose(
    firebaseConnect((props, store) => {
        const { settings } = store.getState(),
            fromDay = moment(settings.date_from.valueOf()).startOf('day').valueOf(),
            toDay = moment(settings.date_to.valueOf()).endOf('day').valueOf();

        const eventsQueryParams = [
            `startAt=${fromDay}`, // 123 is treated as a number instead of a string
            `endAt=${toDay}`,
            "orderByChild=date",
        ];

        const recentQueryParams = [
            `endAt=${moment().startOf('day').valueOf()}`,
            "limitToLast=3",
            "orderByChild=date"
        ];

        return [
            { path: "/events", storeAs: 'recent', queryParams: recentQueryParams, populates },
            { path: "/events", storeAs: 'events', queryParams: eventsQueryParams, populates },
            { path: "/chat", storeAs: 'chat', queryParams: ["orderByChild=date", "limitToLast=25"], populates },
            { path: "/online", storeAs: 'online' }
        ]
    }),
    connect(({ firebase, settings, client, event, draft }) => ({
        recent: populate(firebase, "recent", populates),
        events: populate(firebase, "events", populates),
        chat: populate(firebase, "chat", populates),
        online: populate(firebase, "online", populates),
        auth: firebase.auth,
        profile: firebase.profile,
        settings: settings,
        client: client,
        event: event,
        draft: draft
    }), mapDispatchToProps)
);

export default enhance(withCookies(withRouter(App)));

