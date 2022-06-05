import React, {useEffect, useState} from 'react';
import {compose} from "redux";
import {firebaseConnect} from "react-redux-firebase";
import moment from "moment";

const EventsMonitor = (props) => {
    const [pastEvents, setPastEvents] = useState(0);
    const [incomingEvents, setIncomingEvents] = useState(0);

    useEffect(() => {
        const { firebase } = props;
        const onlineRef = firebase.database().ref("/events");
        const currentDate = moment().startOf('day').valueOf();

        onlineRef.orderByChild("date").endAt(currentDate).once("value").then(snapshot => {
            setPastEvents(snapshot.numChildren());
        });

        onlineRef.orderByChild("date").startAt(currentDate).once("value").then(snapshot => {
            setIncomingEvents(snapshot.numChildren());
        })
    }, []);

    return (
        <small>
            Dotychczas <strong>{pastEvents}</strong> wydarzeń zakończonych i <strong>{incomingEvents}</strong> {incomingEvents > 0 && incomingEvents < 5 ? `nadchodzące` : 'nadchodzących'}.
        </small>
    );
};

export default compose(
    firebaseConnect()
)(EventsMonitor);