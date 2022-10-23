import React from 'react';
import {Comment, Segment} from "semantic-ui-react";
import './ChatMessage.scss';
import avatarPlaceholder from "../../../assets/profile_avatar.png";
import ReportMessage, {
    MESSAGE_REPORTS_LIMIT,
    REPORTED_MESSAGE_PLACEHOLDER
} from "../../components/ReportMessage/ReportMessage";
import UserStatusIndicator from "../../components/UserStatusIndicator/UserStatusIndicator";
import Reactions from "../../components/Reactions/Reactions";
import ReactionsButton from "../../components/ReactionsButton/ReactionsButton";
import {decryptMessage, timestampToHumanTime} from "../../utils";

const ChatMessage = (props) => {
    const {data, id, data:{user, nick, timestamp, message, reports}, type, disableReports, decryptPass} = props;

    const dateToDisplay = timestampToHumanTime(timestamp);

    let userAvatar = avatarPlaceholder,
        userStatus;

    if(user) {
        userAvatar = user.avatarImage || user.avatarUrl || avatarPlaceholder;
        userStatus = user.status;
    }

    return (
        <Segment.Group>
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
                            {reports && reports.length >= MESSAGE_REPORTS_LIMIT ? REPORTED_MESSAGE_PLACEHOLDER : !!decryptPass ? decryptMessage(message, decryptPass) : message}
                        </Comment.Text>
                        <Comment.Actions>
                            {!disableReports && <ReportMessage message={data} id={id} type={type} decryptPass={decryptPass}/>}
                            <Comment.Action as="a" className="comment-reactions">
                                <ReactionsButton data={data}>
                                    <Reactions id={id} data={data} type={type} />
                                </ReactionsButton>
                            </Comment.Action>
                        </Comment.Actions>
                    </Comment.Content>
                </Comment>
            </Segment>
        </Segment.Group>
    );
};

export default ChatMessage;