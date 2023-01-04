import React from 'react';
import {bindActionCreators, compose} from "redux";
import * as actionCreators from "../../actions";
import {firebaseConnect, populate} from "react-redux-firebase";
import {connect} from "react-redux";
import {Dimmer, Image, List, Loader} from "semantic-ui-react";
import avatarPlaceholder from "../../../assets/profile_avatar.png";
import {Link} from "react-router-dom";
import {USER} from "../../routers";
import UserStatusIndicator from "../../components/UserStatusIndicator/UserStatusIndicator";
import './UserList.scss';

const UsersList = (props) => {
    const {users} = props;

    if(!users) {
        return (
            <Dimmer active inverted>
                <Loader active size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    return (
        <div className="user-list-wrapper">
            <List divided verticalAlign='middle'>
                {
                    Object.keys(users).map((key, index) => {
                        const user = users[key];
                        const {avatarImage, displayNick, status} = user;

                        return (
                            <List.Item className="user-link" key={`user-${index}`} as={Link} to={`${USER}/${key}`}>
                                <UserStatusIndicator asAvatar={true} status={status} >
                                    <Image src={avatarImage || avatarPlaceholder} size="mini" avatar />
                                </UserStatusIndicator>
                                <List.Content>
                                    <List.Header>
                                        <strong>{displayNick}</strong>
                                    </List.Header>
                                </List.Content>
                            </List.Item>
                        )
                    })
                }
            </List>
        </div>
    );
};

const populates = [
    { child: "user", root: "users", keyProp: "uid" },
    { child: "avatarImage", root: "users", keyProp: "avatarImage" },
    { child: "status", root: "users", keyProp: "status"}
];

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

const enhance = compose(
    firebaseConnect(() => {
        const usersQueryParams = [
            "orderByChild=displayNick"
        ];

        return [
            { path: "/users", storeAs: 'users', queryParams: usersQueryParams, populates }
        ]
    }),
    connect(({ firebase }) => {
        const allUsers = populate(firebase, "users", populates);
        let users;

        if(!!allUsers) {
            users = {};
            Object.keys(allUsers).forEach(key => {
                if(!!allUsers[key].displayNick) {
                    users = Object.assign(users, {
                        [key]: allUsers[key]
                    })
                }
            });
        }

        users = !!users && Object.keys(users).sort(function(a, b){
            return users[b].status === 'online' ? 1 : -1;
        }).reduce(function (result, key) {
            result[key] = users[key];
            return result;
        }, {});

        return {
            users: users,
            auth: firebase.auth,
            profile: firebase.profile
        }
    }, mapDispatchToProps)
)

export default enhance(UsersList);
