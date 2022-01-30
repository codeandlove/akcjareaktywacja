import React, {useEffect, useRef, useState} from 'react';
import {Button, Comment, Icon, Segment} from "semantic-ui-react";
import avatarPlaceholder from "../../../assets/profile_avatar.png";

import "./ChatSnipped.scss";
import DotCounter from "../../components/DotCounter/DotCounter";
import {withCookies} from "react-cookie";
import {CHAT_LATEST_KEY_COOKIE_NAME} from "../Chat/Chat";
import ReportMessage, {
    MESSAGE_REPORTS_LIMIT,
    REPORTED_MESSAGE_PLACEHOLDER
} from "../../components/ReportMessage/ReportMessage";

const ChatSnipped = (props) => {
    const {data, openChat, isColOpen} = props;
    const [disabled, setDisabled] = useState(false);
    const [lastKey, setLastKey] = useState(null);

    const key = !!data && Object.keys(data)[Object.keys(data).length - 1];
    const res = !!key && data[key];
    const {user} = res;
    let userAvatar = avatarPlaceholder;

    if(user) {
        userAvatar = user.avatarImage || user.avatarUrl || avatarPlaceholder;
    }

    useEffect(() => {
        const {cookies} = props;

        let lastKey = cookies.get(CHAT_LATEST_KEY_COOKIE_NAME);

        if(lastKey) {
            setLastKey((lastKey));
        }

    }, [res])

    return !!res && !disabled ? (
        <div className={`snipped-chat ${isColOpen ? 'col-open': ''}`}>
            <Segment clearing basic>
                <Comment.Group>
                    <Segment key={`comment-${key}`} color="olive">
                        <DotCounter data={data} lastKey={lastKey}/>
                        <Comment>
                            <Button onClick={() => setDisabled(true)} icon="times" floated="right" basic circular />
                            <Comment.Avatar as='div' src={userAvatar}/>
                            <Comment.Content>
                                <Comment.Author as='strong'>
                                    {res.nick}
                                </Comment.Author>
                                <Comment.Text className="short">
                                    {res.reports && res.reports.length >= MESSAGE_REPORTS_LIMIT ? REPORTED_MESSAGE_PLACEHOLDER : res.message}
                                </Comment.Text>
                                <Comment.Actions>
                                    <Comment.Action onClick={openChat}>
                                        <Icon name='reply all' />
                                        Odpowiedz
                                    </Comment.Action>
                                    <ReportMessage message={res} messageKey={key} />
                                </Comment.Actions>
                            </Comment.Content>
                        </Comment>
                    </Segment>
                </Comment.Group>
            </Segment>
        </div>
    ) : <></>
};

export default withCookies(ChatSnipped);
