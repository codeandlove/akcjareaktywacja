import React, {useEffect, useState} from 'react';
import {Confirm, Icon, Popup, Comment} from "semantic-ui-react";
import PropTypes from "prop-types";
import {compose} from "redux";
import {firebaseConnect, isEmpty, isLoaded} from "react-redux-firebase";
import {connect} from "react-redux";
import {notifyToSlackChannel} from "../../utils";

export const MESSAGE_REPORTS_LIMIT = 3;
export const REPORTED_MESSAGE_PLACEHOLDER = 'Wiadomość została uznana za obraźliwą przez innych użytkoników serwisu.';
const SLACK_NOTIFICATION_WEBHOOK_CHANNEL = 'https://hooks.slack.com/services/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';

const ReportMessage = (props) => {
    const {firebase, client: {ip, duuid}, auth, message: {reports, message}, messageKey} = props;
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [alreadyReportedByUser, setAlreadyReportedByUser] = useState(false);
    const [messageReports, setMessageReports] = useState([]);

    const reportLimit = MESSAGE_REPORTS_LIMIT;

    const userDUUID = `${ip}.${duuid}`;

    useEffect(() => {
        if(!!reports) {
            const alreadyReported = reports.filter(report => report === userDUUID);
            setAlreadyReportedByUser(alreadyReported.length > 0);
            setMessageReports(reports);
        }
    },[reports])

    const handleShowConfirmation = () => {
        setOpenConfirmation(true);
    }

    const handleCancelConfirmation = () => {
        setOpenConfirmation(false);
    }

    const handleSendReport = () => {
        setOpenConfirmation(false);
        let user = null;
        if(isEmpty(auth) && isLoaded(auth)) {
            firebase.auth().signInAnonymously().then(res => {
                user = res.uid;
                firebase.update(`chat/${messageKey}`, {
                        reports:  [...messageReports, userDUUID]
                    }
                );
            });
        } else {
            user = auth.uid;
            firebase.update(`chat/${messageKey}`, {
                    reports:  [...messageReports, userDUUID]
                }
            );
        }

        notifyToSlackChannel(SLACK_NOTIFICATION_WEBHOOK_CHANNEL, {text: `Zgłoszono wiadomość ${messageKey} o treści: ${message}, napisany przez użytkownika ${user}`});
    }

    if(messageReports && messageReports.length >= reportLimit) {
        return (
            <Popup
                inverted
                trigger={<Comment.Action><Icon name="flag" color="red" size="small"/>Wiadomość ukryta</Comment.Action>}
                content={`Wiadomość została ukryta, ponieważ została uznana przez ${reportLimit} osoby jako obraźliwa.`}
                on='hover'
            />
        )
    }

    return alreadyReportedByUser ? (
            <Popup
                inverted
                trigger={<Comment.Action><Icon name="flag" color="red" size="small"/> Zgłoszono</Comment.Action>}
                content={`Jako ${messageReports.length} z ${reportLimit} osób zaraportowałaś/eś ten komentarz jako obraźliwy, dziękujemy!`}
                on='hover'
            />
        ) : (
            <>
                <Popup
                    inverted
                    trigger={<Comment.Action onClick={handleShowConfirmation}><Icon name="flag outline" color="grey" size="small"/> Zgłoś</Comment.Action>}
                    content="Oznacz ten komentarz jako obraźliwy"
                    on='hover'
                />
                <Confirm
                    open={openConfirmation}
                    content="Czy chcesz oznaczyć ten komentarz jako obraźliwy?"
                    onConfirm={handleSendReport}
                    onCancel={handleCancelConfirmation}
                    cancelButton="Anuluj"
                    confirmButton="Zatwierdź"
                />
            </>
        )
}

ReportMessage.propTypes = {
    firebase: PropTypes.object.isRequired,
    messageKey: PropTypes.string.isRequired,
    message: PropTypes.object.isRequired
}

const mapStateToProps = state => {
    return {
        client: state.client
    }
};

const enhance = compose(
    firebaseConnect(),
    connect(({firebase: { auth, profile }}) => ({
        auth,
        profile
    })),
    connect(mapStateToProps)
)

export default enhance(ReportMessage);
