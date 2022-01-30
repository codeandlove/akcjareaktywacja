import React from 'react';
import {Transition, Item, Segment, Dimmer, Loader} from "semantic-ui-react";
import moment from "moment";
import {Link} from "react-router-dom";
import {ACTION} from "../../routers";
import ShowOnMap from "../../components/ShowOnMap/ShowOnMap";
import PropTypes from "prop-types";
import {compose} from "redux";
import {firebaseConnect, isEmpty, isLoaded, populate} from "react-redux-firebase";
import {connect} from "react-redux";

const populates = [
    { child: "participants", root: "users", keyProp: "uid" }, // replace participants with user object
    { child: "user", root: "users", keyProp: "uid" },
    { child: "avatarImage", root: "users", keyProp: "avatarImage" }
];


const Recent = (props) => {
    const {recent} = props;

    if(!isLoaded(recent)) {
        return (
            <Dimmer active inverted>
                <Loader size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    let data = [];

    if(!isEmpty(recent)) {
        data = Object.keys(recent).map((key) => {
            return {
                key: key,
                ...recent[key]
            };
        });
    }

    return (
        <Transition.Group
            key="recent-events-list"
            as={Item.Group}
            duration={300}
            animation="fade up"
            divided
        >
            {
                data.map((data, key) => {
                    return (
                        <Item key={`List-item-${key}`}>
                            <Item.Content>
                                <Segment textAlign="left">
                                    <Item.Header as="h4">
                                        <Link to={`/${ACTION}/${data.slug}`} >
                                            {data.title}
                                        </Link>
                                        <ShowOnMap {...data} {...props} />
                                    </Item.Header>
                                    <Item.Meta>
                                        <small>Data wydarzenia: <strong>{moment(data.date).format("DD MMMM YYYY, HH:mm")}</strong>, Organizator: <strong>{data.owner}</strong></small>
                                    </Item.Meta>
                                </Segment>
                            </Item.Content>
                        </Item>
                    )
                })
            }
        </Transition.Group>
    );
};


Recent.propTypes = {
    firebase: PropTypes.object.isRequired
}

const enhance = compose(
    firebaseConnect((props, store) => {

        const recentQueryParams = [
            `endAt=${moment().subtract(1, 'day').startOf('day').valueOf()}`,
            "orderByChild=date",
            "limitToLast=3"
        ];

        return [
            { path: "/events", storeAs: 'recent', queryParams: recentQueryParams, populates },
        ]
    }),
    connect(({firebase, firebase: { auth, profile }}) => ({
        auth,
        profile,
        recent: populate(firebase, "recent", populates)
    }))
)

export default enhance(Recent);