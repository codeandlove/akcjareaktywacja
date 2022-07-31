import React, {useEffect} from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { compose } from "redux";
import { firebaseConnect, isEmpty, isLoaded } from "react-redux-firebase";
import { bindActionCreators } from "redux";
import * as actionCreators from "./../../actions";
import moment from "moment";
import "./EventsList.scss";
import { Header, Segment, Item, Button, Dimmer, Loader } from "semantic-ui-react";
import ShowOnMap from "../../components/ShowOnMap/ShowOnMap";
import {ACTION, EVENT_FORM, SETTINGS} from "../../routers";
import JoinEvent from "./../Join/Join";
import Countdown from "../../components/Countrdown/Countdown";
import Recent from "../Recent/Recent";
import EventsMonitor from "../../components/EventsMonitor/EventsMonitor";
import EventsPagination from "../../components/EventsPagination/EventsPagination";
import ReactionsButton from "../../components/ReactionsButton/ReactionsButton";
import Reactions from "../../components/Reactions/Reactions";
import {EVENT_LATEST_CHAT_KEY_COOKIE_NAME} from "../Chat/Chat";
import {withCookies} from "react-cookie";
import DotCounter from "../../components/DotCounter/DotCounter";
import {withRouter} from "react-router";

const EventsList = (props) => {
    const {toggleColumn, history, close, match, settings, settings: {date_from, date_to, show_recent_events}, cookies, events} = props;

    useEffect(() => {
        if(!match.isExact) {
            toggleColumn(true);
        }
    });

    const listView = data => {
        const duration = moment(date_to).diff(moment(date_from), "days");

        if(data.length < 1) {
            return (
                <Segment>
                    <h3>Wydarzenia od <u>{moment(date_from).format("DD MMMM YYYY")}</u> do <u>{moment(date_to).format("DD MMMM YYYY")}</u> ({duration}dni)</h3>
                    <p>Brak wydarzeń w wybranym zakresie dat. Zmień zakres dat w zakładce <Link to={`/${SETTINGS}`}>Ustawienia</Link></p>
                </Segment>
            )
        }

        return (
            <Item.Group
                key="events-list"
                relaxed
            >
                {
                    data.map((data, key) => {
                        const lastKey = cookies.get(EVENT_LATEST_CHAT_KEY_COOKIE_NAME+data.key);
                        const relationsLength = (!!data.chat && Object.keys(data.chat).length) || 0;

                        return (
                            <Item key={`list-item-${key}`}>
                                <Item.Content>
                                    <Segment.Group>
                                        <Segment textAlign="left">
                                            <Item.Header as="h3">
                                                <Link to={`/${ACTION}/${data.slug}`} >
                                                    {data.title}
                                                </Link>
                                                <ShowOnMap {...data} {...props} />
                                            </Item.Header>
                                            <Item.Meta>
                                                <small>Data wydarzenia: <strong>{moment(data.date).format("DD MMMM YYYY, HH:mm")}</strong></small><br />
                                                <small>Do wydarzenia pozostało <strong><Countdown toDate={data.date} /></strong></small><br />
                                                <small>Organizator: <strong>{data.owner}</strong></small>
                                                { relationsLength ? (
                                                    <>
                                                        <br /><small>Relacji: <strong>{relationsLength}</strong></small>
                                                        <DotCounter data={data.chat}
                                                                    lastKey={lastKey}
                                                                    color="blue"/>
                                                    </>
                                                ) : <></> }
                                            </Item.Meta>
                                            <Item.Description>
                                                {data.short}
                                            </Item.Description>
                                            <Item.Extra className="reactions">
                                                <ReactionsButton data={data} position="top right">
                                                    <Reactions id={data.key} data={data} type="events" />
                                                </ReactionsButton>
                                            </Item.Extra>
                                        </Segment>
                                        <Segment attached textAlign="right">
                                            <JoinEvent eventKey={data.key} event={data}/>
                                        </Segment>
                                    </Segment.Group>
                                </Item.Content>
                            </Item>
                        )
                    })
                }
            </Item.Group>
        )
    }

    const weeksView = data => {
        const days = [moment(date_from)];
        const duration = moment(date_to).diff(date_from, "days");

        if(duration < 0) {
            return (
                <p>Brak wyników spełaniących kryteria</p>
            )
        }

        for(let i = 0; i < duration; i++) {
            days.push(moment(date_from).add(i+1, "days"));
        }

        return (
            <Item.Group
                key="events-list"
                divided
            >
                {
                    days.map((day, key) => {
                        const dayEvents = data.filter((event) => {
                            return moment(day).isSame(moment(event.date), "day");
                        });

                        const isInPast = (moment(day).diff(moment().startOf('day'), "days", true) < -.5);

                        return (
                            <Item key={`List-item-${key}`}>
                                <Item.Content>
                                    <Item.Header as={Header} color={isInPast ? "grey" : "olive"}>
                                        {moment(day).format("dddd, DD MMMM YYYY")}
                                    </Item.Header>

                                    {
                                        (isInPast && dayEvents.length <= 0) ? (
                                            <p><small>Tego dnia nie odbyło się żadne wydarzenie...</small></p>
                                        ) : null
                                    }

                                    {
                                        (!isInPast && dayEvents.length <= 0) ? (
                                            <p><small>W tym dniu nie ma żadnych wydarzeń jeszcze...</small></p>
                                        ) : null
                                    }

                                    {
                                        !isInPast ?
                                            <p><Link to={`/${EVENT_FORM}/${day.format('DD-MM-YYYY')}`}>Dodaj własne wydarzenie</Link></p>
                                            : null
                                    }

                                    {
                                        dayEvents.length > 0 ?
                                            dayEvents.map((event, key) => {
                                                    const lastKey = cookies.get(EVENT_LATEST_CHAT_KEY_COOKIE_NAME+event.key);
                                                    const relationsLength = (!!event.chat && Object.keys(event.chat).length) || 0;

                                                    return (
                                                        <Segment.Group key={`List-item-events-${key}`}>
                                                            <Segment
                                                                secondary={isInPast}
                                                                textAlign="left"
                                                            >
                                                                <Item.Header as="h4" >
                                                                    <Link to={`/${ACTION}/${event.slug}`}>
                                                                        {event.title}
                                                                    </Link>
                                                                    <ShowOnMap {...event} {...props} />
                                                                </Item.Header>
                                                                <Item.Meta>
                                                                    <small>Data wydarzenia: <strong>{moment(event.date).format("DD MMMM YYYY, HH:mm")}</strong></small><br />
                                                                    <small>Do wydarzenia pozostało <strong><Countdown toDate={event.date} /></strong></small><br />
                                                                    <small>Organizator: <strong>{event.owner}</strong></small>
                                                                    { relationsLength ? (
                                                                        <>
                                                                            <br /><small>Relacji: <strong>{relationsLength}</strong></small>
                                                                            <DotCounter data={event.chat}
                                                                                        lastKey={lastKey}
                                                                                        color="blue"/>
                                                                        </>
                                                                    ) : <></>
                                                                    }
                                                                </Item.Meta>
                                                                <Item.Description>
                                                                    {event.short}
                                                                </Item.Description>
                                                                <Item.Extra className="reactions">

                                                                    <ReactionsButton data={event} position="top right">
                                                                        <Reactions id={event.key} data={event} type="events" />
                                                                    </ReactionsButton>
                                                                </Item.Extra>
                                                            </Segment>
                                                            <Segment attached textAlign="right">
                                                                <JoinEvent eventKey={event.key} event={event}/>
                                                            </Segment>
                                                        </Segment.Group>
                                                    )
                                                }
                                            )
                                            : <></>
                                    }
                                </Item.Content>
                            </Item>
                        )
                    })
                }
            </Item.Group>
        )
    }

    const renderList = () => {
        let data = [];
        const {view_type} = settings;

        if(!isEmpty(events)) {
            data = Object.keys(events).map((key) => {
                return {
                    key: key,
                    ...events[key]
                };
            });
        }

        const viewType = view_type || "weeksView";

        switch(viewType) {
            case "weeksView":
                return weeksView(data);
            default:
                return listView(data);
        }
    }

    return (
        <div className="events-list">
            <Segment clearing basic>
                <Button basic onClick={close} floated="right" icon="x" />
                <Button basic floated="right" icon="sliders" onClick={() => history.replace(`/${SETTINGS}`)} />
                <Header floated="left" size="large">
                    Wydarzenia
                </Header>
            </Segment>
            <Segment basic textAlign="center">
                {
                    !isLoaded(events) ? (
                        <Dimmer active inverted>
                            <Loader size="large">Proszę czekać...</Loader>
                        </Dimmer>
                    ) : (
                        <>
                            <EventsMonitor />
                            {renderList()}
                            <EventsPagination />
                        </>
                    )

                }

            </Segment>
            {
                show_recent_events ? (
                    <>
                        <Segment clearing basic>
                            <Header as="h3" dividing>
                                Ostatnio zakończone
                            </Header>
                        </Segment>
                        <Segment basic textAlign="center">
                            <Recent {...props} />
                        </Segment>
                    </>
                ):(
                    <></>
                )
            }
        </div>
    )
}

const mapStateToProps = state => {
    return {
        settings: state.settings
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth } }) => ({ auth })),
    connect(mapStateToProps, mapDispatchToProps)
)(withCookies(withRouter(EventsList)));
