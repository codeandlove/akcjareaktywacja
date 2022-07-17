import React, { Component } from "react";
import './EventPage.scss';
import { connect } from "react-redux";
import { compose } from "redux";
import {firebaseConnect, isLoaded, isEmpty, populate} from "react-redux-firebase";

import renderHTML from "react-render-html";
import moment from "moment";
import Join from "./../Join/Join";

import {Container, Segment, Header, Button, Icon, Table, Dimmer, Loader, Item, Image, Label} from "semantic-ui-react";
import {Helmet} from "react-helmet";
import PropTypes from "prop-types";
import Countdown from "../../components/Countrdown/Countdown";
import {EVENT_FORM} from "../../routers";
import {analytics} from "../../../firebase/analytics";
import PhoneNumberButton from "../../components/PhoneNumberButton/PhoneNumberButton";
import ShareButton from "../../components/ShareButton/ShareButton";
import ReactionsButton from "../../components/ReactionsButton/ReactionsButton";
import Reactions from "../../components/Reactions/Reactions";
import Relations from "../Relations/Relations";
import {getCategoriesDataByIds} from "../../utils";

class EventPage extends Component {
    componentDidMount() {
        this.props.open();
        analytics.logEvent('User opened a event page');
    }

    closeEventPage = () => {
        const { router } = this.context;
        const { isDraft } = this.props;

        router.history.push(`${isDraft ? `/${EVENT_FORM}` : `/`}`);
        this.props.close();
    }

    renderCategories = (categoriesIds) => {
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

    renderPage = (data) => {
        const {match: {url}, isDraft} = this.props;
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
                    <Button basic onClick={() => this.closeEventPage()} floated="right" icon="x" />
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
                                        <Table.Cell>{this.renderCategories(categories)}</Table.Cell>
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
                    <Button floated="left" onClick={() => this.closeEventPage()} >
                        <Icon name="arrow left" /> Wróć
                    </Button>
                </Segment>
            </div>
        )
    };

    render() {

        const { event, isDraft } = this.props;

        if(isDraft) {

            let draft = JSON.parse(localStorage.getItem("eventDraft"));

            if(isEmpty(draft)) {
                return (
                    <p>Brak danych</p>
                );
            } else {
                return this.renderPage(draft);
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
            return null;
        } else {
            const data = Object.assign({eventKey: Object.keys(event)[0]}, Object.values(event)[0]);

            return this.renderPage(data);
        }
    }
}

EventPage.contextTypes = {
    router: PropTypes.object
};

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

export default enhance(EventPage)