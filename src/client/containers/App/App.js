import React, {useEffect, useState} from "react";

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
import {collapseSidebar, openSidebar} from "../../actions";

const populates = [
    { child: "participants", root: "users", keyProp: "uid" },
    { child: "user", root: "users", keyProp: "uid" },
    { child: "avatarImage", root: "users", keyProp: "avatarImage" },
    { child: "status", root: "users", keyProp: "status"}
];

const toFloatNumber = (str, val) => {
    str = str.toString();
    str = str.slice(0, (str.indexOf(".")) + val + 1);
    return Number(str);
}

const App = (props) => {
    const {setClientData, history, firebase, client, openMenu, closeMenu, closePage, menuIsOpen, pageIsOpen, sidebarIsOpen, sidebarIsExpanded,
        addEvent, removeEvent, events, recent, chat, auth, profile, cookies} = props;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        isMobileDetection();

        window.addEventListener('resize', isMobileDetection);

        setTimeout(async () => {
            await askForPermissionToReceiveNotifications();
        }, 15000)

        const getClientData = async () => {
            if(Object.keys(client).length) {
                if (process.env.NODE_ENV === 'production') {
                    notifyToSlackChannel(SLACK_NEW_VISITOR_HOOK,
                        {
                            "text": "Returning Visitor.",
                            "blocks": [
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "mrkdwn",
                                        "text": `${formatSlackNotifyMessage(client)}`
                                    }
                                }
                            ]
                        }
                    );
                }

                return true;
            }

            try {
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

                    if(!!clientData) {
                        return true;
                    }
                });
            } catch (error) {
                console.log(error);
            }
        }

        getClientData();

        return window.removeEventListener('resize', isMobileDetection);
    }, []);

    const isMobileDetection = () => {
        setIsMobile(window.innerWidth <= 768)
    }

    const openChat = () => {
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

    return (
        <div className="app">
            <Menu borderless>
                <Menu.Item
                    onClick={menuIsOpen ? closeMenu : openMenu}
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
                    onClick={() => {closePage(); closeMenu(); }}
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
                                onClick={closeMenu}
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
                                        onClick={closeMenu}
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
                                                   onClick={closeMenu}
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
                    visible={menuIsOpen}
                    icon="labeled"
                    vertical
                >
                    <Menu.Item
                        name="events"
                        as={Link}
                        to={`/${EVENTS_LIST}`}
                        onClick={closeMenu}
                    >
                        <Icon name="calendar" className="alternate outline" />
                        Wydarzenia
                    </Menu.Item>
                    <Menu.Item
                        name="chat"
                        as={Link}
                        to={`/${CHAT}`}
                        onClick={closeMenu}
                    >
                        <Icon name="comments" className="outline have-dot">
                            <DotCounter data={chat} lastKey={lastKey}/>
                        </Icon>
                        Chat
                    </Menu.Item>
                    <Menu.Item
                        name="users"
                        as={Link}
                        to={`/`}
                        disabled
                    >
                        <Icon name="smile" className="outline" />
                        Użytkownicy
                    </Menu.Item>
                    <Dropdown item text="Pomoc" pointing="left" icon="help" className="dropdown-menu">
                        <Dropdown.Menu>
                            <Dropdown.Item
                                as={Link}
                                to={`/${STATIC}/${TERMS_OF_USE}`}
                                onClick={closeMenu}
                            >
                                Regulamin
                            </Dropdown.Item>
                            <Dropdown.Item
                                as={Link}
                                to={`/${STATIC}/${GDPR}`}
                                onClick={closeMenu}
                            >
                                RODO
                            </Dropdown.Item>
                            <Dropdown.Item
                                as={Link}
                                to={`/${STATIC}/${PRIVACY_POLICY}`}
                                onClick={closeMenu}
                            >
                                Prywatność
                            </Dropdown.Item>
                            <Dropdown.Item
                                as={Link}
                                to={`/${STATIC}/${CONTACT}`}
                                onClick={closeMenu}
                            >
                                Kontakt
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Sidebar>
                <Sidebar.Pusher>
                    <Sidebar.Pushable onClick={closeMenu}>
                        <ChatSnipped
                            data={chat}
                            openChat={openChat}
                        />
                        <Layout
                            events={events}
                            recent={recent}
                            chat={chat}
                            isMobile={isMobile}
                        >
                            {
                                !isLoaded(events) ? (
                                    <Dimmer active>
                                        <Loader active size="large">Proszę czekać...</Loader>
                                    </Dimmer>
                                ) : (
                                    <Map
                                        events={events}
                                        recent={recent}
                                        isMobile={isMobile}
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
    connect(({ firebase, settings, client, event, layout }) => ({
        recent: populate(firebase, "recent", populates),
        events: populate(firebase, "events", populates),
        chat: populate(firebase, "chat", populates),
        online: populate(firebase, "online", populates),
        auth: firebase.auth,
        profile: firebase.profile,
        settings: settings,
        client: client,
        event: event,
        ...layout
    }), mapDispatchToProps)
);

export default enhance(withCookies(withRouter(App)));

