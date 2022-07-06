import React, {Component, useEffect, useState} from 'react';
import {firebaseConnect, isEmpty, isLoaded} from 'react-redux-firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';
import './Join.scss';
import avatarPlaceholder from "../../../assets/profile_avatar.png";
import moment from 'moment';
import {Button, Icon, Image, Label, Popup} from 'semantic-ui-react';

const Join = (props) => {
    const {firebase, event, auth, client: {ip, duuid}, eventKey, floated} = props;
    const [users, setUsers] = useState([]);
    const [members, setMembers] = useState([]);
    const [clientsIps, setClientsIps] = useState([]);
    const [isParticipant, setIsParticipant] = useState(true);

    useEffect(() => {
        update();
    }, [event]);

    const update = () => {

        if(isEmpty(event)) {
            return;
        }

        //All user's Ids
        const users = Object.keys(event.participants).map(i => {
            if(event.participants[i] === String(event.participants[i])){
                return event.participants[i];
            } else {
                return event.participants[i].uid;
            }
        });

        //Members (only with displayNickname param)
        const members = Object.keys(event.participants).filter(i => {
            return event.participants[i] === Object(event.participants[i]) && event.participants[i].displayNick;
        }).map(i => {
            return event.participants[i];
        });

        let isAlreadyJoined;

        if(isLoaded(auth) && (isEmpty(auth) || auth.isAnonymous)) {
            isAlreadyJoined = users.filter(id => {
                return id === auth.uid;
            }).length > 0;

            if (!isAlreadyJoined && !isEmpty(event.clients_ip)) {
                isAlreadyJoined = event.clients_ip.filter(client_ip => {
                    return client_ip === `${ip}.${duuid}`
                }).length > 0;
            }
        } else {
            isAlreadyJoined = members.filter(member => {
                return member.uid === auth.uid;
            }).length > 0;
        }

        setUsers(users);
        setMembers(members);
        setIsParticipant(isAlreadyJoined);
        setClientsIps(event.clients_ip || [])
    };

    const joinToEvent = () => {
        if(isEmpty(auth) && isLoaded(auth)) {
            firebase.auth().signInAnonymously().then(res => {
                firebase.update(`events/${eventKey}`, {
                        participants:  [...users, res.user.uid],
                        clients_ip: [...clientsIps, `${ip}.${duuid}` ]
                    }
                );
            });
        } else {
            firebase.update(`events/${eventKey}`, {
                    participants:  [...users, auth.uid],
                    clients_ip: [...clientsIps, `${ip}.${duuid}` ]
                }
            );
        }
    };

    const renderParticipants = () => {
        const {owner} = event;

        const allMembers = members.map((member, index) => {
            const avatar = member.avatarImage || member.avatarUrl || avatarPlaceholder;

            return (<span key={`member-${index}`}><Popup
                key={member.displayNick}
                content={member.displayNick}
                trigger={<Image src={avatar} avatar />}
                inverted
            /></span>)
        });

        const anonymousAmount = users.length - members.length > 1 ? users.length - members.length - 1 : 0;

        if(members.length > 0) {
            return (
                <>{owner}, {anonymousAmount} anonimów oraz {allMembers}</>
            )
        } else {
            return `${owner} oraz ${anonymousAmount} anonimów.`;
        }
    };

    if(!isEmpty(event)) {

        //if event is from past, user can not join anymore
        const isInPast = moment(event.date).isSame(moment().subtract( 1, "days"), "day") || (moment(event.date).diff(moment(), 'days') < 0);

        const floatedAttr = (!!floated) ? {
            floated: floated
        } : null;

        if(isInPast){
            return (
                <Button as="div" labelPosition="left" {...floatedAttr} className="join-button">
                    <Label as="span" basic pointing="right"><small >{renderParticipants()}</small></Label>
                    <Button disabled >
                        <Icon name="hand victory" />
                        Już po spotkaniu...
                    </Button>
                </Button>
            )
        } else {
            return (
                <Button as="div" labelPosition="left" {...floatedAttr} className="join-button">
                    <Label as="span" basic pointing="right"><small>{renderParticipants()}</small></Label>
                    {
                        !isParticipant ?
                            <Button color="olive" onClick={joinToEvent}>
                                <Icon name="plus" />
                                Dołącz
                            </Button>
                            :
                            <Button disabled >
                                <Icon name="check" />
                                Dołączono
                            </Button>
                    }
                </Button>
            )
        }
    } else {
        return <></>;
    }
}

const enhance = compose(
    firebaseConnect(),
    connect(({ firebase: { auth }, client }) => ({ auth, client }))
);

export default enhance(Join);

