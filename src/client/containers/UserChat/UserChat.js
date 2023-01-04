import React, {useEffect, useRef, useState} from 'react';
import {bindActionCreators, compose} from "redux";
import * as actionCreators from "../../actions";
import {firebaseConnect, isEmpty, isLoaded, populate, withFirebase} from "react-redux-firebase";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import {analytics} from "../../../firebase/analytics";
import {Button, Comment, Dimmer, Grid, Header, Icon, Image, Loader, Segment} from "semantic-ui-react";
import UserStatusIndicator from "../../components/UserStatusIndicator/UserStatusIndicator";
import avatarPlaceholder from "../../../assets/profile_avatar.png";
import {Link} from "react-router-dom";
import {USER} from "../../routers";
import ChatMessage from "../ChatMessage/ChatMessage";
import ChatForm from "../ChatForm/ChatForm";
import {useInView} from "../../hooks";

const UserChat = (props) => {
    const {closeSidebar, openSidebar, firebase, message, usersChat, auth: {uid}, match: {params: {messageId}}} = props;
    const chatFormRef = useRef();
    const chatFormInView = useInView(chatFormRef);

    useEffect(() => {
        openSidebar();
        analytics.logEvent('User profile opened');
    }, []);

    useEffect(() => {
        if(usersChat) {
            Object.keys(usersChat).forEach(key => {
                const message = usersChat[key];
                const recipientsArray = message.recipients;
                if(recipientsArray && recipientsArray.includes(uid)) {
                    removeRecipient(key);
                }
            })
        }
    }, [chatFormInView])

    const removeRecipient = (key) => {
        const messageRef = firebase.database().ref(`messages/${messageId}/chat/${key}/recipients`);
        messageRef.once('value').then(snapshot => {
            if(snapshot.exists()) {
                const val = snapshot.val();
                messageRef.set([
                    ...val.filter(id => id !== uid)
                ])
            }
        })
    }

    if(!message) {
        return (
            <Dimmer active inverted>
                <Loader active size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    const {me, user} = message;
    const userData = user.uid === uid ? me : user;

    const suggestions = [
        {
            id: 0,
            display: me.displayNick
        },
        {
            id: 1,
            display: user.displayNick
        }
    ];

    const renderUserDetails = (data) => {
        const {displayNick, avatarImage, status} = data;

        return (
            <>
                <div className="user-photo">
                    <UserStatusIndicator asAvatar={true} status={status}>
                        <Image src={avatarImage || avatarPlaceholder} size="tiny" avatar />
                    </UserStatusIndicator>
                </div>
                <strong>{displayNick}</strong>
            </>
        )
    }

    return (
        <div>
            <Segment clearing basic>
                <Button basic onClick={closeSidebar} floated="right" icon="x" />
                <Header floated="left" size="large">
                    Wiadomość
                </Header>
            </Segment>
            <Segment clearing basic textAlign="center">
                <Grid columns={2} stackable textAlign='center'>
                    <Grid.Row verticalAlign='middle'>
                        <Grid.Column>
                            {
                                renderUserDetails(me)
                            }
                        </Grid.Column>
                        <Grid.Column>
                            {
                                renderUserDetails(user)
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
            <Segment>
                <Button as={Link} to={`/${USER}/${userData.uid}`}>
                    <Icon name="arrow left" />
                    Wróć
                </Button>
            </Segment>
            {
                usersChat ? (
                    <Segment clearing basic>
                        <Comment.Group>
                            {
                                Object.keys(usersChat).map(key => {
                                    return (
                                        <ChatMessage
                                            data={usersChat[key]}
                                            key={`comment-${key}`}
                                            id={key}
                                            type={`messages/${messageId}/chat`}
                                            disableReports={true}
                                            decryptPass={messageId}
                                        />
                                    )
                                })
                            }
                        </Comment.Group>
                    </Segment>
                ) : <></>
            }
            <Segment clearing basic>
                <div ref={chatFormRef}>
                    <ChatForm
                        suggestions={suggestions}
                        type="messages"
                        id={messageId}
                        notify={false}
                        encryptPass={messageId}
                        recipients={[userData.uid]}
                    />
                </div>
            </Segment>
        </div>
    );
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

const mapStateToProps = state => {
    return state;
};

const populates = [
    { child: "myId", root: "users", keyProp: "uid", childAlias: "me" },
    { child: "userId", root: "users", keyProp: "uid", childAlias: "user" },
    { child: "user", root: "users", keyProp: "uid" },
    { child: "avatarImage", root: "users", keyProp: "avatarImage" },
    { child: "status", root: "users", keyProp: "status"}
];

const enhance = compose(
    firebaseConnect((props) => {
        return ([
            {
                path: `messages/${props.match.params.messageId}`,
                storeAs: "message",
                populates
            },
            {
                path: `messages/${props.match.params.messageId}/chat`,
                storeAs: "usersChat",
                populates
            }
        ])
    }),
    connect(({ firebase }) => ({
            auth: firebase.auth,
            message: populate(firebase, "message", populates),
            usersChat: populate(firebase, "usersChat", populates)
    })),
    connect(mapStateToProps, mapDispatchToProps)
);


export default enhance(withRouter(withFirebase(UserChat)));
