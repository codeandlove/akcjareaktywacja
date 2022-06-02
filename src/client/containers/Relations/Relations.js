import React, {useEffect, useState} from 'react';
import {analytics} from "../../../firebase/analytics";
import {Comment, Divider, Header, Message, Segment} from "semantic-ui-react";
import ChatMessage from "../ChatMessage/ChatMessage";
import ChatForm from "../ChatForm/ChatForm";
import {CHAT_LATEST_KEY_COOKIE_NAME} from "../Chat/Chat";
import {compose} from "redux";
import {firebaseConnect, isEmpty, isLoaded} from "react-redux-firebase";
import {connect} from "react-redux";

const Relations = (props) => {
    const {data, cookies, id, participants, auth} = props;
    const [suggestions, setSuggestions] = useState([]);
    const [isParticipant, setIsParticipant] = useState(false);

    useEffect(() => {
        analytics.logEvent('User opened a relation');
    }, [])

    useEffect(() => {
        if(!isEmpty(auth) && isLoaded(auth) && !!participants) {
            const {uid} = auth;
            Object.keys(participants).forEach(key => {
                const participant = participants[key];
                if(participant === uid || (!!participant.uid && participant.uid === uid)) {
                    setIsParticipant(true)
                }
            })
        }
    }, [participants, auth])

    useEffect(() => {
        if(data) {
            // const latestReceivedKey = cookies.get(CHAT_LATEST_KEY_COOKIE_NAME),
            //     latestKey = Object.keys(data)[Object.keys(data).length - 1];
            // if(latestReceivedKey !== latestKey || !latestReceivedKey) {
            //     cookies.set(CHAT_LATEST_KEY_COOKIE_NAME, latestKey);
            // }

            setSuggestions(findSuggestions());
        }
    }, [data]);

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
        <>
            <Segment clearing basic>
                <Header as="h2" size="medium">
                    Relacje z wydarzenia
                </Header>
                {
                    !isParticipant ? (
                        <Message
                            color="blue"
                            size="mini"
                            content="Dołącz do spotkania, aby móc dodawać relacje do tego wydarzenia."
                        />
                    ) : <></>
                }
            </Segment>
            {
                isParticipant ? (
                    <Segment clearing basic>
                        <ChatForm suggestions={suggestions} type="events" id={id} />
                    </Segment>
               ) : <></>
            }
            <Segment clearing basic>
                {
                    !!data ? (
                        <Comment.Group>
                            {
                                Object.keys(data).reverse().map(key => {
                                    return (
                                        <>
                                            <ChatMessage
                                                data={data[key]}
                                                key={`comment-${key}`}
                                                id={key}
                                                type={`events/${id}/chat`}
                                            />
                                        </>
                                    )
                                })
                            }
                        </Comment.Group>
                    ) : (
                        <p>
                            Jeszcze żadna relacja nie została dodana do tego wydarzenia.
                        </p>
                    )
                }
            </Segment>
        </>
    )
}

const enhance = compose(
    firebaseConnect(),
    connect(({firebase: { auth, profile }}) => ({
        auth,
        profile
    }))
)

export default enhance(Relations);