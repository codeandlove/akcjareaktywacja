import React, {useEffect, useState} from 'react';
import {Icon, Label, Message, Popup} from "semantic-ui-react";
import './Reactions.scss';
import {compose} from "redux";
import {firebaseConnect, isEmpty, isLoaded} from "react-redux-firebase";
import {connect} from "react-redux";
import moment from "moment";

const reactionIcons = [
    {
        name: 'love',
        icon: 'love',
        title: 'Super!'
    },
    {
        name: 'cool',
        icon: 'cool',
        title: 'Fajne'
    },
    {
        name: 'rotfl',
        icon: 'rotfl',
        title: 'HaHa!'
    },
    {
        name: 'dumb',
        icon: 'dumb',
        title: 'Kiepskie'
    }
]

const Reactions = (props) => {
    const {auth, firebase, id, type, data: {reactions}} = props;

    let initialState = {};
    reactionIcons.map(item => initialState[item.name] = {
        amount: 0,
        voted: false
    });
    const [state, setState] = useState(initialState);
    const [showMessage, setShowMessage] = useState(false);
    const [click, setClick] = useState({});

    useEffect(() => {
        if(reactions) {
            const {uid} = auth;
            let updatedState = {};

            reactionIcons.map(item => {
                return updatedState[item.name] = reactions[item.name] ? {
                    amount: reactions[item.name].length,
                    voted: reactions[item.name].filter(item => item.uid === uid).length > 0
                } : {
                    amount: 0,
                    voted: false
                }
            });

            setState({
                ...state,
                ...updatedState
            });
        } else {
            setState(initialState);
        }
    }, [reactions]);

    const updateEntity = (name) => {
        const reactionsRef = firebase.database().ref(`/${type}/${id}`).child('reactions');
        const {uid} = auth;
        const timestamp = moment().valueOf();

        reactionsRef.once("value").then( async snapshot => {
            if(snapshot.exists()) {
                const val = snapshot.val();
                const alreadyExists = val[name] && val[name].filter(item => item.uid === uid).length;

                if(alreadyExists) {
                    // When user want to un-vote specific reaction
                    await reactionsRef.child(name).once('value').then(snapshot => {
                        if(snapshot.exists()) {
                            const val = snapshot.val();
                            const index = val.findIndex(object => {
                                return object.uid === uid;
                            });
                            reactionsRef.update({
                                [name]: [
                                    ...val.slice(0, index),
                                    ...val.slice(index + 1)
                                ]
                            })
                        }
                    });
                } else {
                    let foundIndex, foundKey;

                    Object.keys(val).forEach(key => {
                        const item = val[key];
                        let tmpIndex = -1;

                        tmpIndex = item.findIndex(object => {
                            return object.uid === uid;
                        });

                        if(tmpIndex !== -1) {
                            foundIndex = tmpIndex;
                            foundKey = key;
                        }
                    });

                    if(foundKey) {
                        reactionsRef.update({
                            [foundKey]: [
                                ...val[foundKey].slice(0, foundIndex),
                                ...val[foundKey].slice(foundIndex + 1)
                            ],
                            [name]: [
                                ...val[name] || [],
                                {
                                    uid: uid,
                                    timestamp: timestamp
                                }
                            ]
                        });
                    } else {
                        reactionsRef.update({
                            [name]: [
                                ...val[name] || [],
                                {
                                    uid: uid,
                                    timestamp: timestamp
                                }
                            ]
                        });
                    }
                }
            } else {
                //when reaction does not exists at all
                await reactionsRef.set({
                    [name]: [
                        {
                            uid: uid,
                            timestamp: timestamp
                        }
                    ]
                })
            }
        });
    }

    const handleReaction = (type) => {
        if(isLoaded(auth) && !isEmpty(auth) && !auth.isAnonymous) {
            if(Object.keys(click).length < 1) {
                updateEntity(type);
                setIconClicked(type)
            }
        } else {
           setShowMessage(true);
        }
    }

    const setIconClicked = (type) => {
        setClick({
            type: type
        });
        setTimeout(() => setClick({}), 1000);
    }

    const renderReactionIcon = (type) => {
        const {icon, title} = reactionIcons.filter(x => x.name === type)[0];
        const val = state[type];
        const {amount, voted} = val;

        return (
            <Popup
                size="mini"
                inverted
                pinned
                on={['hover', 'click']}
                trigger={
                    <Label as="button" className="reaction" size='mini' basic onClick={() => handleReaction(type)}>
                        <Icon name={`${icon}${voted ? ' active' : ''}${click.type === type && voted ? ' clicked' : ''}`} />{amount > 99 ? '99+' : amount}
                    </Label>
                }
                content={amount > 99 ? `${amount} ${title}` : `${title}`}
                position='top center'
                key={`reaction-${type}`}
            />
        )
    }

    return (
        <>
            <>
                {
                    reactionIcons.map(reaction => {
                        return renderReactionIcon(reaction.name)
                    })
                }
            </>
            {
                showMessage ? (
                    <Message color="blue" size="mini">
                        <p>Zaloguj się, aby zareagować.</p>
                    </Message>
                ) : ''
            }
        </>
    );
}

const enhance = compose(
    firebaseConnect(),
    connect(({firebase: { auth, profile }}) => ({
        auth,
        profile
    }))
)

export default enhance(Reactions);