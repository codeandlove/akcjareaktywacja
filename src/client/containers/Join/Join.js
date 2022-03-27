import React, { Component } from 'react';
import {firebaseConnect, isEmpty, isLoaded} from 'react-redux-firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';
import './Join.scss';
import avatarPlaceholder from "../../../assets/profile_avatar.png";
import moment from 'moment';
import {Button, Icon, Image, Label, Popup} from 'semantic-ui-react';

class Join extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            members: [],
            clients_ip: [],
            isParticipant: true
        }
    }

    componentDidMount() {
        this.updateStates(this.props);
    }

    componentWillReceiveProps(props) {
        this.updateStates(props);
    }

    updateStates = props => {
        const { event, auth, client: {ip, duuid} } = props;

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

        this.setState({
            users: users,
            members: members,
            isParticipant: isAlreadyJoined,
            clients_ip: event.clients_ip || []
        });
    };

    joinToEvent = () => {

        const { eventKey, firebase, auth, client: {ip, duuid} } = this.props;
        const { users, clients_ip } = this.state;

        if(isEmpty(auth) && isLoaded(auth)) {
            firebase.auth().signInAnonymously().then(res => {
                firebase.update(`events/${eventKey}`, {
                        participants:  [...users, res.user.uid],
                        clients_ip: [...clients_ip, `${ip}.${duuid}` ]
                    }
                );
            });
        } else {
            firebase.update(`events/${eventKey}`, {
                    participants:  [...users, auth.uid],
                    clients_ip: [...clients_ip, `${ip}.${duuid}` ]
                }
            );
        }
    };

    renderParticipants = () => {
        const { users, members } = this.state;

        const allMembers = members.map((member, index) => {
            const avatar = member.avatarImage || member.avatarUrl || avatarPlaceholder;

            return (<span key={`member-${index}`}><Popup
                key={member.displayNick}
                content={member.displayNick}
                trigger={<Image src={avatar} avatar />}
                inverted
            /></span>)
        });

        if(members.length > 0) {
            return (
                <>{allMembers} oraz {users.length - members.length} anonimów.</>
            )
        } else {
            return `${users.length - members.length} anonimów.`;
        }
    };

    render() {
        const { isParticipant } = this.state;
        const { event, floated } = this.props;

        if(!isEmpty(event)) {

            //if event is from past, user can not join anymore
            const isInPast = moment(event.date).isSame(moment().subtract( 1, "days"), "day") || (moment(event.date).diff(moment(), 'days') < 0);

            const floatedAttr = (!!floated) ? {
                floated: floated
            } : null;

            if(isInPast){
                return (
                    <Button as="div" labelPosition="left" {...floatedAttr} className="join-button">
                        <Label as="span" basic pointing="right"><small >{this.renderParticipants()}</small></Label>
                        <Button disabled >
                            <Icon name="hand victory" />
                            Już po spotkaniu...
                        </Button>
                    </Button>
                )
            } else {
                return (
                    <Button as="div" labelPosition="left" {...floatedAttr} className="join-button">
                        <Label as="span" basic pointing="right"><small>{this.renderParticipants()}</small></Label>

                        {
                            !isParticipant ?
                                <Button color="olive" onClick={this.joinToEvent}>
                                    <Icon name="plus" />
                                    Dołącz
                                </Button>
                                :
                                <Button disabled onClick={this.handleQuitEvent}>
                                    <Icon name="check" />
                                    Dołączono
                                </Button>
                        }
                    </Button>
                )
            }

        } else {
            return null;
        }

    }

}

const enhance = compose(
    firebaseConnect(),
    connect(({ firebase: { auth }, client }) => ({ auth, client }))
);

export default enhance(Join);

