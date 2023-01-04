import React from 'react';
import {Dimmer, Image, Label, List, Loader, Message} from "semantic-ui-react";
import UserStatusIndicator from "../../components/UserStatusIndicator/UserStatusIndicator";
import avatarPlaceholder from "../../../assets/profile_avatar.png";
import {Link} from "react-router-dom";
import {MESSAGE} from "../../routers";
import {bindActionCreators, compose} from "redux";
import * as actionCreators from "../../actions";
import {firebaseConnect, populate, withFirebase} from "react-redux-firebase";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import "./AccountMessagesList.scss";
import {decryptMessage, timestampToHumanTime} from "../../utils";

const AccountMessagesList = (props) => {
    const {messages, auth: {uid}} = props;

    const renderUserDetails = (data) => {
        if(!data) return <></>

        const {status, avatarImage} = data;

        return (
            <UserStatusIndicator asAvatar={true} status={status} >
                <Image src={avatarImage || avatarPlaceholder} size="mini" avatar />
            </UserStatusIndicator>
        )
    }
    if(!messages) {
        return (
            <Dimmer active inverted>
                <Loader active size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    if(!Object.keys(messages).length) {
        return (
            <Message positive
                     icon="comments outline"
                     header="Coś tu pusto, zacznij czatować"
                     content="Brak wiadomości od innych użytkowników... nie czekaj, wyślij swoją pierwszą wiadomość."
            />
        )
    }

    return (
        <div className="messages-list-wrapper">
            <List divided verticalAlign='middle'>
                {
                    Object.keys(messages).map((key, index) => {
                        const messageObj = messages[key];
                        const {user, me, chat} = messageObj;
                        const userData = user.uid === uid ? me : user;
                        const {displayNick} = userData;
                        const lastMessage = chat[Object.keys(chat).pop()];
                        const unread = Object.keys(chat).map(key => chat[key]).filter(message => {
                            return !!message.recipients && message.recipients.includes(uid);
                        });

                        const unreadAmount = !!unread && unread.length;
                        const {message, timestamp} = lastMessage;

                        return (
                            <List.Item className="message-link" key={`message-${index}`} as={Link} to={`/${MESSAGE}/${key}`}>
                                {renderUserDetails(userData)}
                                <List.Content className="message-link-content">
                                    <List.Header>
                                        {displayNick}<br />
                                        <small>{timestampToHumanTime(timestamp)}</small>
                                    </List.Header>
                                    <List.Description>
                                        {
                                            unreadAmount ? (
                                                <Label className="unread-label" color="green" size="mini" floating circular>
                                                    {unreadAmount}
                                                </Label>
                                            ) : <></>
                                        }
                                        {decryptMessage(message, key)}
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        )
                    })
                }
            </List>
        </div>
    );
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

const mapStateToProps = state => {
    return state;
};

const populates = [
    { child: "messages", root: "messages", keyProp: "messagesId" },
    { child: "myId", root: "users", keyProp: "uid", childAlias: "me" },
    { child: "userId", root: "users", keyProp: "uid", childAlias: "user" }
]

const enhance = compose(
    firebaseConnect(() => {
        return ([
            {
                path: 'messages',
                populates
            }
        ])
    }),
    connect(({ firebase }, props) => {
        const {messages} = props;

        const allMessages = populate(firebase, 'messages', populates);
        let myMessages;

        if(!!allMessages && !!messages) {
            myMessages = {};
            Object.keys(allMessages).forEach(key => {
                if(messages.includes(key) && !!allMessages[key].chat) {
                    myMessages = Object.assign(myMessages, {
                        [key]: allMessages[key]
                    })
                }
            });
        }

        return {
            auth: firebase.auth,
            profile: firebase.profile,
            messages: myMessages
        }
    }),
    connect(mapStateToProps, mapDispatchToProps)
);

export default enhance(withRouter(withFirebase(AccountMessagesList)));