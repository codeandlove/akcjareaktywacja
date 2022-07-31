import React, {useEffect} from "react";
import './EventPage.scss';
import { connect } from "react-redux";
import { compose } from "redux";
import {firebaseConnect, isLoaded, isEmpty, populate} from "react-redux-firebase";

import renderHTML from "react-render-html";
import moment from "moment";
import Join from "./../Join/Join";

import {Segment, Header, Button, Icon, Table, Dimmer, Loader, Image} from "semantic-ui-react";
import {Helmet} from "react-helmet";
import Countdown from "../../components/Countrdown/Countdown";
import {EVENT_FORM} from "../../routers";
import {analytics} from "../../../firebase/analytics";
import PhoneNumberButton from "../../components/PhoneNumberButton/PhoneNumberButton";
import ShareButton from "../../components/ShareButton/ShareButton";
import ReactionsButton from "../../components/ReactionsButton/ReactionsButton";
import Reactions from "../../components/Reactions/Reactions";
import Relations from "../Relations/Relations";
import {getCategoriesDataByIds} from "../../utils";
import {withRouter} from "react-router";

const EventPage = (props) => {
    const {open, close, isDraft, event, history, match} = props;

    useEffect(() => {
        open();
        analytics.logEvent('User opened a event page');
    }, []);

    const closeEventPage = () => {
        history.push(`${isDraft ? `/${EVENT_FORM}` : `/`}`);
        close();
    }

    const renderCategories = (categoriesIds) => {
        const categoriesData = getCategoriesDataByIds(categoriesIds);

        return (
            <span className="category-row">
                {
                    categoriesData.map((category, key) => {
                        const {label, icon} = category;

                        return (
                            <>
                                {!!icon ? <Image size="mini" src={`${process.env.PUBLIC_URL}/categories/${icon}.svg`}/> : <></>} {label} {key < categoriesData.length - 1 ? <Icon name="chevron right" size="small"/> : ''}
                            </>
                        )
                    })
                }
            </span>
        )
    }

    const  renderPage = (data) => {
        console.log(match)
        const {url} = match;
        const {owner, title, description, eventKey, short, date, location, contact, categories} = data;

        return (
            <div className="event-page">
                {!isDraft ? (
                    <Helmet>
                        <meta charSet="utf-8" />
                        <title>Akcjareaktywacja.pl | Grupowe spotkania na żywo | {title} | {owner}</title>
                        <meta name="description" content={`${short}`} />
                        <link rel="canonical" href={`https://akcjareaktywacja.pl${url}`} />
                    </Helmet>
                ) : null}

                <Segment clearing basic>
                    <Button basic onClick={closeEventPage} floated="right" icon="x" />
                    <Header as="h1" floated="left" size="large">
                        {title}
                        <Header.Subheader>
                            <span>Organizator: <strong>{owner}</strong></span><br />
                            <small>Data: <strong>{moment(date).format("DD MMMM YYYY, HH:mm")}</strong> - pozostało: <strong><Countdown toDate={date} /></strong></small>
                        </Header.Subheader>
                    </Header>
                </Segment>
                <Segment clearing basic>
                    {
                        !!description ? renderHTML(description) : <p>Nic tutaj nie ma na razie... dodaj opis wydarzenia.</p>
                    }
                </Segment>
                <Segment clearing basic>
                    <Table compact color="olive">
                        <Table.Body>
                            {
                                !!categories ? (
                                    <Table.Row>
                                        <Table.Cell>Kategoria</Table.Cell>
                                        <Table.Cell>{renderCategories(categories)}</Table.Cell>
                                    </Table.Row>
                                ) : <></>
                            }

                            <Table.Row>
                                <Table.Cell>Data</Table.Cell>
                                <Table.Cell>{moment(date).format("DD MMMM YYYY, HH:mm")}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Organizator</Table.Cell>
                                <Table.Cell>{owner}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Miejsce</Table.Cell>
                                <Table.Cell>{location}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Kontakt</Table.Cell>
                                <Table.Cell>
                                    <PhoneNumberButton text={contact} />
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                    {
                        eventKey ? (
                            <Segment.Group>
                                <Segment textAlign="right" basic className="reactions" >
                                    <ReactionsButton data={data} position="top right">
                                        <Reactions id={eventKey} data={data} type="events" />
                                    </ReactionsButton>
                                </Segment>
                                <Segment clearing basic>
                                    <Join eventKey={eventKey} event={data} floated="right" />
                                </Segment>
                            </Segment.Group>
                        ): null
                    }
                </Segment>
                {
                    !isDraft ? (
                        <Relations id={eventKey} participants={data.participants}/>
                    ) : <></>
                }
                <Segment basic clearing>
                    {
                        !isDraft ? (
                            <ShareButton url={url} floated="right"/>
                        ) : <></>
                    }
                    <Button floated="left" onClick={closeEventPage} >
                        <Icon name="arrow left" /> Wróć
                    </Button>
                </Segment>
            </div>
        )
    };

    if(isDraft) {
        const draft = JSON.parse(localStorage.getItem("eventDraft"));

        if(isEmpty(draft)) {
            return (
                <p>Brak danych</p>
            );
        } else {
            return renderPage(draft);
        }
    }

    if(!event) {
        return (
            <Dimmer active inverted>
                <Loader size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    if(!isLoaded(event)) {
        return <p>Brak danych</p>;
    } else {
        const data = Object.assign({eventKey: Object.keys(event)[0]}, Object.values(event)[0]);

        return renderPage(data);
    }
}

const populates = [
    { child: "participants", root: "users", keyProp: "uid" }, // replace participants with user object
    { child: "user", root: "users", keyProp: "uid" },
    { child: "avatarImage", root: "users", keyProp: "avatarImage" }
];

const enhance = compose(
    firebaseConnect((props) => {
        return ([
            {
                path: "events",
                storeAs: "event",
                queryParams: [ 'orderByChild=slug', `equalTo=${props.match.params.slug}` ],
                populates
            }
        ])

    }),
    connect(({ firebase }) => ({
        event: populate(firebase, "event", populates)
    }))
);

export default enhance(withRouter(EventPage))