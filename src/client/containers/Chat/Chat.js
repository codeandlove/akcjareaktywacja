import React, {useEffect, useRef, useState} from "react";

import ChatForm from './../ChatForm/ChatForm';

import { Segment, Header, Button, Comment } from "semantic-ui-react";

import "./Chat.scss";

import {analytics} from "../../../firebase/analytics";
import {withCookies} from "react-cookie";
import ChatMessage from "../ChatMessage/ChatMessage";

export const CHAT_LATEST_KEY_COOKIE_NAME = 'lastChatKey';
export const EVENT_LATEST_CHAT_KEY_COOKIE_NAME = 'eventChatLatestKey';

const Chat = (props) => {
    const {data, close, toggleColumn, cookies} = props;
    const [suggestions, setSuggestions] = useState([]);
    const [messagesAmount, setMessagesAmout] = useState(0);
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

            setSuggestions(findSuggestions());
            setMessagesAmout(data.length);
        }
    }, [data]);

    useEffect(() => {
        scrollToBottom();
    }, [messagesAmount])

    const scrollToBottom = () => {
        if(chatListRef.current) {
            chatListRef.current.scrollIntoView({
                behavior: 'smooth'
            })
        }
    };

    const findSuggestions = () => {
        const result = Object.keys(data).map(key => {
            return {
                id: data[key].nick,
                display: data[key].nick
            };
        });

        return result.filter((item, index, self) =>
            self.findIndex(t => t.id === item.id && t.display === item.display) === index);
    }

    return (
        <div className="chat-wrapper">
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
                                            <ChatMessage data={data[key]} key={`comment-${key}`} id={key} type="chat" />
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
                <ChatForm scrollToBottom={scrollToBottom} suggestions={suggestions} />
            </Segment>
        </div>
    )
}

export default withCookies(Chat);
