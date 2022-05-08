import React, {useEffect, useLayoutEffect, useState} from 'react';
import {compose} from "redux";
import {firebaseConnect, isEmpty, isLoaded, populate} from "react-redux-firebase";
import {connect} from "react-redux";
import './VisitorOnlineTracker.scss';
import {Icon, Popup} from "semantic-ui-react";

const VisitorsOnlineTracker = (props) => {
    const {firebase, auth, client: {ip, duuid}, online} = props;
    const [visitorsAmount, setVisitorsAmount] = useState(0);
    const [isWindowVisible, setIsWindowVisible] = useState(true);
    const [loggedInVisitorsAmount, setLoggedInVisitorsAmount] = useState(0);
    const onlineRef = firebase.database().ref("/online");
    const client_id = `${ip}.${duuid}`;
    const offset = 0;

    useEffect(() => {
        if(isLoaded(auth) && ip && duuid && isWindowVisible) {
            setTimeout(() => {
                setUserOnline();
            }, 1000);
        }
    }, [ip, duuid, auth, isWindowVisible])

    useEffect(() => {
        if(online && isWindowVisible){
            setLoggedInVisitorsAmount(Object.keys(online).filter(key => {
                return online[key].isLoggedIn;
            }).length);

            setVisitorsAmount(Object.keys(online).length + offset);
        }
    }, [online, isWindowVisible])

    useEffect(() => {
        if(!isWindowVisible) {
            removeUserOnline();
        }
    }, [isWindowVisible])

    const onVisibilityChange = () => {
        setIsWindowVisible(document.visibilityState === 'visible');
    };

    useLayoutEffect(() => {
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, []);

    const setUserOnline = () => {
        const {isAnonymous, uid} = auth;
        let client_data = {
            id: client_id
        }

        if (!isEmpty(auth) && !!uid) {
            client_data = {
                ...client_data,
                uid: uid
            }
        }

        if (!isEmpty(auth) && !isAnonymous) {
            client_data = {
                ...client_data,
                isLoggedIn: !isAnonymous
            }
        }

        onlineRef.orderByChild("id").equalTo(client_id).once("value").then(async snapshot => {
            if (!snapshot.exists()) {
                await firebase.push('online', client_data)
            } else {
                const result = snapshot.val();
                const key = result && Object.keys(result)[0];

                const visitorRef = firebase.database().ref("/online").child(key);

                await visitorRef.once('value', async snapshot => {
                    if (snapshot.exists()) {
                        await visitorRef.set(client_data);
                    }
                })
            }
        });

        unsetUserOnline();
    }

    const unsetUserOnline = () => {
        onlineRef.orderByChild("id").equalTo(client_id).once("value").then(async snapshot => {
            if (snapshot.exists()) {
                const result = snapshot.val();
                const key = result && Object.keys(result)[0];

                const visitorRef = firebase.database().ref("/online").child(key);

                await visitorRef.once('value', async snapshot => {
                    if (snapshot.exists()) {
                        await visitorRef.onDisconnect().remove();
                    }
                })
            }
        })
    }

    const removeUserOnline = () => {
        onlineRef.orderByChild("id").equalTo(client_id).once("value").then(async snapshot => {
            if (snapshot.exists()) {
                const result = snapshot.val();
                const key = result && Object.keys(result)[0];

                firebase.database().ref("/online").child(key).remove();
            }
        })
    }

    return (
        <div className="visitor-tracker">
            <Popup
                inverted
                size="mini"
                trigger={
                    <div>
                        <Icon name="dot circle outline" color={visitorsAmount > 0 ? 'green' : 'red'} size="small"/>
                        <span>
                             Teraz online <strong>{visitorsAmount}</strong> użytkowników
                        </span>
                    </div>
                }
                content={`(${loggedInVisitorsAmount}) zalogowanych i (${visitorsAmount - loggedInVisitorsAmount}) anonimów`}
                position="bottom center"
            />
        </div>
    );
};

export default compose(
    firebaseConnect((props, store) => {
        return [
            { path: "/online", storeAs: 'online'},
        ]
    }),
    connect(({firebase, firebase: { auth, profile }, client}) => ({
        auth,
        profile,
        client,
        online: populate(firebase, "online", [])
    }))
)(VisitorsOnlineTracker);