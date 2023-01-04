import React, {useEffect, useState} from 'react';
import {bindActionCreators, compose} from "redux";
import * as actionCreators from "../../actions";
import {firebaseConnect, isEmpty, withFirebase} from "react-redux-firebase";
import {connect} from "react-redux";
import {Button, Comment, Dimmer, Header, Icon, Image, Loader, Segment} from "semantic-ui-react";
import {analytics} from "../../../firebase/analytics";
import {withRouter} from "react-router";
import avatarPlaceholder from "../../../assets/profile_avatar.png";
import {Link} from "react-router-dom";
import {MESSAGE, USER, USERS} from "../../routers";
import UserStatusIndicator from "../../components/UserStatusIndicator/UserStatusIndicator";
import './User.scss';
import moment from "moment";

const User = (props) => {
    const {closeSidebar, openSidebar, firebase, history, user, profile, match: {params: {userId}}, auth: {uid}, blockList} = props;
    const [messageChatId, setMessageChatId] = useState(null);
    const [isUserBlocked, setIsUserBlocked] = useState(true);

    useEffect(() => {
        openSidebar();
        analytics.logEvent('User profile opened');
    }, []);

    useEffect(() => {
        if(!isEmpty(user) && !isEmpty(profile)) {
            const messageKey = findMessageChatId(user);
            if(messageKey) {
                setMessageChatId(messageKey);
            }
        }
    }, [user, profile]);

    useEffect(() => {
        console.log(blockList.indexOf(userId));
        setIsUserBlocked(blockList.indexOf(userId) > -1);
    }, [blockList])

    if(!user) {
        return (
            <Dimmer active inverted>
                <Loader active size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    const findMessageChatId = (refUser) => {
        const {messages} = profile;
        if(!messages || !refUser || !refUser.messages) return null;

        return messages.filter(id => refUser.messages.includes(id))[0];
    }

    const openUserChat = () => {
        if (!messageChatId) {
            CreateNewChat();
            return;
        }

        history.push(`/${MESSAGE}/${messageChatId}`);
    }

    const toggleBlockUser = () => {
        const blockListRef = firebase.database().ref(`block_list/${uid}`);

        blockListRef.once('value').then(snapshot => {
            let val = [];

            if(snapshot.exists()) {
                val = snapshot.val();

                if(val.includes(userId)) {
                    const index = val.indexOf(userId);
                    blockListRef.set([...val.slice(0, index), ...val.slice(index + 1)]);
                    return;
                }
            }

            blockListRef.set([...val, userId]);
        });

    }

    const CreateNewChat = () => {
        const messageRef = firebase.database().ref('messages');
        const messageTimestamp = moment().valueOf();
        const userKeys = [uid, userId];
        const messagesPromises = [];
        let messageKey;

        messageRef.push({
            myId: uid,
            userId: userId,
            timestamp: messageTimestamp
        }).then(res => {
            messageKey = res.key;

            userKeys.forEach(userKey => {
                const userMessagesRef = firebase.database().ref(`users/${userKey}`).child('messages');

                const snapPromise = userMessagesRef.once("value").then((snapshot) => {
                    if(snapshot.exists()) {
                        const val = snapshot.val();
                        userMessagesRef.set(!!val ? [
                            ...val,
                            messageKey
                        ] : [messageKey]);
                    } else {
                        userMessagesRef.set([messageKey]);
                    }
                }).catch(err => err);

                messagesPromises.push(snapPromise);
            });

            Promise.all(messagesPromises).then(() => {
                history.push(`/${MESSAGE}/${messageKey}`);
            }).catch(err => err);
        });
    }

    const {displayNick, avatarImage, status} = user;

    return (
        <div>
            <Segment clearing basic>
                <Button basic onClick={closeSidebar} floated="right" icon="x" />
                <Header floated="left" size="large">
                    {displayNick}
                </Header>
            </Segment>
            <Segment clearing basic textAlign="center">
                <div className="user-photo">
                    <UserStatusIndicator asAvatar={true} status={status}>
                        <Image src={avatarImage || avatarPlaceholder} size="small" avatar />
                    </UserStatusIndicator>
                </div>
                <h3>{displayNick}</h3>
            </Segment>
            {
                userId !== uid ? (
                    <Segment clearing basic textAlign="center">
                        <Button onClick={toggleBlockUser}>
                            <Icon name="x" />
                            {
                                isUserBlocked ? 'Odblokuj' : 'Zablokuj'
                            }
                        </Button>
                        <Button primary onClick={openUserChat}>
                            <Icon name="chat" />
                            {
                                !!messageChatId ? 'Wiadomości' : 'Wyślij wiadomość'
                            }
                        </Button>
                    </Segment>
                ) : <></>
            }
            <Segment>
                <Button as={Link} to={`/${USERS}`}>
                    <Icon name="arrow left" />
                    Wróć
                </Button>
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

const enhance = compose(
    firebaseConnect((props) => {
        return ([
            {
                path: `users/${props.match.params.userId}`,
                storeAs: "user"
            },
            {
                path: 'block_list',
                storeAs: 'blockList'
            }
        ])

    }),
    connect(({ firebase,  firebase: { auth, profile } }) => ({
        user: firebase.data.user,
        auth: auth,
        profile: profile,
        blockList: !isEmpty(auth) ? firebase.data.blockList ? firebase.data.blockList[auth.uid] : [] : []
    })),
    connect(mapStateToProps, mapDispatchToProps)
);

export default enhance(withRouter(withFirebase(User)));
