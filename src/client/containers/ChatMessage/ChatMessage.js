import React from 'react';
import {Comment, Segment} from "semantic-ui-react";
import moment from "moment";
import avatarPlaceholder from "../../../assets/profile_avatar.png";
import ReportMessage, {
    MESSAGE_REPORTS_LIMIT,
    REPORTED_MESSAGE_PLACEHOLDER
} from "../../components/ReportMessage/ReportMessage";
import UserStatusIndicator from "../../components/UserStatusIndicator/UserStatusIndicator";

const ChatMessage = (props) => {
    const {data, messageKey, data:{user, nick, timestamp, message, reports}} = props;


    const isInPast = (moment(timestamp).diff(moment(), "days", true) < -.5)

    const dateToDisplay = isInPast ? moment(timestamp).format("DD MMMM YYYY, HH:mm:ss") : moment(timestamp).fromNow()

    let userAvatar = avatarPlaceholder,
        userStatus;

    if(user) {
        userAvatar = user.avatarImage || user.avatarUrl || avatarPlaceholder;
        userStatus = user.status;
    }

    return (
        <Segment color="olive" >
            <Comment>
                <UserStatusIndicator asAvatar={true} status={userStatus} >
                    <Comment.Avatar as='div' src={userAvatar} />
                </UserStatusIndicator>
                <Comment.Content>
                    <Comment.Author as='strong'>{nick}</Comment.Author>
                    <Comment.Metadata>
                        {`${dateToDisplay}`}
                    </Comment.Metadata>
                    <Comment.Text className="short">
                        {reports && reports.length >= MESSAGE_REPORTS_LIMIT ? REPORTED_MESSAGE_PLACEHOLDER : message}
                    </Comment.Text>
                    <Comment.Actions>
                        <ReportMessage message={data} messageKey={messageKey} />
                    </Comment.Actions>
                </Comment.Content>
            </Comment>
        </Segment>
    );
};

export default ChatMessage;