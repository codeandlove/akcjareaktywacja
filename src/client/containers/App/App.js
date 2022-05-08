import React, { Component } from "react";
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

class App extends Component {
    constructor() {
        super();

        this.state = {
            auth: null,
            isColOpen: window.innerWidth > 768,
            isColExpanded: false,
            isPageOpen: false,
            eventKey: null,
            menuVisible: false,
            event: null,
            events: null,
            chat: null,
            isMobile: false,
            hasError: false
        }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.log(error, errorInfo);
    }

    async componentDidMount() {
        const clientData =  ls.get('clientDetails');

        this.isMobileDetection();
        window.addEventListener('resize', this.isMobileDetection.bind(this));

        setTimeout(async () => {
            await askForPermissionToReceiveNotifications();
        }, 30000)

        try {
            if(clientData) {
                this.props.setClientData(clientData);

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

                        this.props.setClientData(clientData);

                        ls.set('clientDetails', clientData);
                    });
                }

                clientData = {...clientData, ...{
                    defaultCoordinates: defaultCoordinates,
                    duuid: generateClientDeviceUUID()
                }};

                this.props.setClientData(clientData);

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
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.isMobileDetection.bind(this));
    }

    componentWillReceiveProps(props) {
        const { events, recent, chat, auth} = props;

        this.setState({
            events: events,
            recent: recent,
            chat: chat,
            auth: auth
        });
    }

    isMobileDetection = () => {
        this.setState({
            isMobile: window.innerWidth <= 768
        })
    }

    toggleMenu = (state) => {
        this.setState(s => {
            return {
                menuVisible: !state ? state : !s.menuVisible
            }
        });
    };

    toggleColExpanded = () => {
        this.setState(s => {
            return {
                isColExpanded: !s.isColExpanded
            }
        })
    };

    togglePage = (toggle) => {
        this.setState(s => {
            return {
                menuVisible: false,
                isPageOpen: toggle,
                eventKey: !toggle ? null : s.eventKey
            }
        });
    };

    toggleColumn = toggle => {
        const { router } = this.context;

        this.setState({
            menuVisible: false,
            isColExpanded: false,
            isColOpen: toggle
        }, () => {
            this.togglePage(false);

            if(!toggle) {
                router.history.replace("/");
            }
        });
    };

    updateEvent = props => {
        this.setState(s => {
            return {
                event: {...s.event, ...props}
            }
        })
    };

    openEventForm = props => {
        const {lat, lng} = props;
        const { router } = this.context;

        this.setState({
            isColOpen: true,
            isColExpanded: false,
            event: {
                coordinates: {
                    lat: lat,
                    lng: lng
                }
            }
        }, () => router.history.replace(`/${EVENT_FORM}`));
    };

    closeEventForm = () => {
        const { router } = this.context;

        this.setState({
            isColOpen: false,
            isColExpanded: false,
            event: null
        }, () => router.history.push("/"));

        localStorage.removeItem("eventDraft")
    };

    handleSaveEvent = props => {
        const { router } = this.context;
        this.props.firebase.push("events", props).then(() => {
            this.setState({
                event: null,
                isColExpanded: false
            }, () => router.history.push("/"))
        });
    };

    openChat = () => {
        const { router } = this.context;
        this.toggleColumn(true);
        router.history.push(`/${CHAT}`);
    }

    render() {
        const { events, recent, event, chat, menuVisible, auth, isMobile, hasError} = this.state;

        const { profile, cookies } = this.props;

        const dropdownTrigger = (
            <>
                {
                    !isEmpty(auth) && !auth.isAnonymous ? <Avatar size="mini" /> : <></>
                }
                {
                    !isMobile ? `Witaj, ${profile.displayNick || profile.displayName}` : <></>
                }
            </>
        )

        const lastKey = cookies.get(CHAT_LATEST_KEY_COOKIE_NAME);

        if (hasError) {
            return (
                <div className="bug-container">
                    <img src={picture} className="picture-img" alt="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." title="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." />
                    <strong>Przepraszamy, coś poszło nie tak... Wróć do nas za parę minut.</strong>
                    <p>Jeśli problem się powtarza, daj nam znać na: <a href="mailto:akcjareaktywacjaofficial@gmail.com">akcjareaktywacjaofficial@gmail.com</a></p>
                </div>
            )
        }

        return (
            <div className="app">
                <Menu borderless>
                    <Menu.Item
                        onClick={this.toggleMenu}
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
                        onClick={() => this.togglePage(false)}
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
                                    onClick={() => this.toggleColumn(true)}
                                >
                                    <Icon name="plus circle" size="large" color="olive" />
                                    <span>Nowe wydarzenie</span>
                                </Menu.Item>
                                {
                                    isEmpty(auth) || auth.isAnonymous ? (
                                        <Menu.Item
                                            key="user-login-nav"
                                            className="login-item"
                                            name="login"
                                            as={Link}
                                            to={`/${LOGIN}`}
                                            onClick={() => this.toggleColumn(true)}
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
                                                                   onClick={() => this.toggleColumn(true)}
                                                    />
                                                    <Dropdown.Item text="Wyloguj"
                                                                   as={Link}
                                                                   to="/"
                                                                   onClick={() => this.props.firebase.logout()}
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
                        visible={menuVisible}
                        icon="labeled"
                        vertical
                    >
                        <Menu.Item
                            name="events"
                            as={Link}
                            to={`/${EVENTS_LIST}`}
                            onClick={() => this.toggleColumn(true)}
                        >
                            <Icon name="calendar" className="alternate outline" />
                            Wydarzenia
                        </Menu.Item>
                        <Menu.Item
                            name="chat"
                            as={Link}
                            to={`/${CHAT}`}
                            onClick={() => this.toggleColumn(true)}
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
                                    onClick={() => this.toggleColumn(true)}
                                >
                                    Regulamin
                                </Dropdown.Item>
                                <Dropdown.Item
                                    as={Link}
                                    to={`/${STATIC}/${GDPR}`}
                                    onClick={() => this.toggleColumn(true)}
                                >
                                    RODO
                                </Dropdown.Item>
                                <Dropdown.Item
                                    as={Link}
                                    to={`/${STATIC}/${PRIVACY_POLICY}`}
                                    onClick={() => this.toggleColumn(true)}
                                >
                                    Prywatność
                                </Dropdown.Item>
                                <Dropdown.Item
                                    as={Link}
                                    to={`/${STATIC}/${CONTACT}`}
                                    onClick={() => this.toggleColumn(true)}
                                >
                                    Kontakt
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Sidebar>
                    <Sidebar.Pusher>
                        <Sidebar.Pushable onClick={() => this.toggleMenu(false)}>
                            <ChatSnipped data={chat} {...this.state} openChat={this.openChat} />
                            <Layout
                                {...this.state}
                                auth={auth}
                                colClose={() => this.toggleColumn(false)}
                                pageClose={() => this.togglePage(false)}
                                pageOpen={() => this.togglePage(true)}
                                toggleColExpand={this.toggleColExpanded}
                                toggleColumn={val => this.toggleColumn(val)}
                                formCancel={this.closeEventForm}
                                saveEvent={props => this.handleSaveEvent(props)}
                                updateEvent={props => this.updateEvent(props)}
                                toggleSettings={this.toggleSettings}
                            >
                                {
                                    !isLoaded(events) ? (
                                        <Dimmer active>
                                            <Loader size="large">Proszę czekać...</Loader>
                                        </Dimmer>
                                    ) : (
                                        <Map
                                            {...this.state}
                                            events={events}
                                            recent={recent}
                                            event={event}
                                            addEvent={props => this.openEventForm(props)}
                                            updateEvent={props => this.updateEvent(props)}
                                            viewEvent={key => this.viewEvent(key)}
                                            cancelEvent={this.closeEventForm}
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
}

App.contextTypes = {
    router: PropTypes.object
};

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

export default enhance(withCookies(App));

