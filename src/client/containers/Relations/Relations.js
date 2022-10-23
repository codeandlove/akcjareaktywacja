import React, {useEffect, useState} from 'react';
import {analytics} from "../../../firebase/analytics";
import {Comment, Header, Message, Segment} from "semantic-ui-react";
import ChatMessage from "../ChatMessage/ChatMessage";
import ChatForm from "../ChatForm/ChatForm";
import {EVENT_LATEST_CHAT_KEY_COOKIE_NAME} from "../Chat/Chat";
import { withCookies } from 'react-cookie';
import {compose} from "redux";
import {firebaseConnect, isEmpty, isLoaded, populate} from "react-redux-firebase";
import {connect} from "react-redux";

const Relations = (props) => {
    const {relations, cookies, id, participants, auth} = props;
    const [suggestions, setSuggestions] = useState([]);
    const [isParticipant, setIsParticipant] = useState(false);
    const eventChatKeyCookieName = EVENT_LATEST_CHAT_KEY_COOKIE_NAME+id;

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
        if(relations) {
            const latestReceivedKey = cookies.get(eventChatKeyCookieName),
                latestKey = Object.keys(relations)[Object.keys(relations).length - 1];
            if(latestReceivedKey !== latestKey || !latestReceivedKey) {
                cookies.set(eventChatKeyCookieName, latestKey);
            }

            setSuggestions(findSuggestions());
        }
    }, [relations]);

    const findSuggestions = () => {
        const result = Object.keys(relations).map(key => {
            return {
                id: relations[key].nick,
                display: relations[key].nick
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
                        <ChatForm suggestions={suggestions} type="events" id={id} notify={true}/>
                    </Segment>
               ) : <></>
            }
            <Segment clearing basic>
                {
                    !!relations ? (
                        <Comment.Group>
                            {
                                Object.keys(relations).reverse().map(key => {
                                    return (
                                        <ChatMessage
                                            data={relations[key]}
                                            key={`comment-${key}`}
                                            id={key}
                                            type={`events/${id}/chat`}
                                        />
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

const populates = [
    { child: "user", root: "users", keyProp: "user" },
    { child: "avatarImage", root: "users", keyProp: "avatarImage" }
];

const enhance = compose(
    firebaseConnect((props, store) => {
        const {id} = props;
        return [
            { path: `events/${id}/chat`, storeAs: 'relations'},
        ]
    }),
    connect(({id, firebase: { auth, profile }, firebase}) => {
        return {
            auth,
            profile,
            relations: populate(firebase, `relations`, populates)
        }
    })
)

export default enhance(withCookies(Relations));
