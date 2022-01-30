import React, {useEffect, useRef} from "react";

import ChatForm from './../ChatForm/ChatForm';

import moment from 'moment';

import avatarPlaceholder from "./../../../assets/profile_avatar.png";

import { Container, Segment, Header, Button, Comment } from "semantic-ui-react";

import "./Chat.scss";

import {analytics} from "../../../firebase";
import {withCookies} from "react-cookie";
import ChatMessage from "../ChatMessage/ChatMessage";

export const CHAT_LATEST_KEY_COOKIE_NAME = 'lastChatKey';

const Chat = (props) => {
    const { data, close, toggleColumn, cookies } = props;
    const chatListRef = useRef();

    useEffect(() => {
        toggleColumn(true);
        analytics.logEvent('User opened a chat');
    }, [])

    useEffect(() => {
        if(data) {
            const latestReceivedKey = cookies.get(CHAT_LATEST_KEY_COOKIE_NAME),
                latestKey = Object.keys(data)[Object.keys(data).length - 1];
            if(latestReceivedKey !== latestKey || !latestReceivedKey) {
                cookies.set(CHAT_LATEST_KEY_COOKIE_NAME, latestKey);
            }
        }

        scrollToBottom();
    }, [data])

    const scrollToBottom = () => {
        if(chatListRef.current) {
            chatListRef.current.scrollIntoView({
                behavior: 'smooth'
            })
        }
    };

    return (
        <Container className="chat-wrapper">
            <Segment clearing basic>
                <Button basic onClick={close} key="close-event-list" floated="right" icon="x" />
                <Header floated="left" size="large">
                    Chat
                </Header>
            </Segment>
            <Segment clearing basic className="chat-comments-wrapper">
                <div className="chat-comments-container">
                    {
                        !!data ? (
                            <Comment.Group>
                                {
                                    Object.keys(data).map(key => {
                                        return (
                                            <ChatMessage data={data[key]} key={`comment-${key}`} messageKey={key} />
                                        )
                                    })
                                }
                            </Comment.Group>
                        ) : null
                    }
                    <div className="to-scroll" ref={chatListRef}></div>
                </div>
            </Segment>
            <Segment basic className="chat-form-wrapper">
                <ChatForm scrollToBottom={scrollToBottom} />
            </Segment>
        </Container>
    )
}

export default withCookies(Chat);
