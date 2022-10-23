import React, {useEffect} from 'react';
import {bindActionCreators, compose} from "redux";
import * as actionCreators from "../../actions";
import {firebaseConnect} from "react-redux-firebase";
import {connect} from "react-redux";
import {Button, Header, Segment} from "semantic-ui-react";
import {analytics} from "../../../firebase/analytics";
import UsersList from "../UsersList/UsersList";

const Users = (props) => {
    const {closeSidebar, openSidebar} = props;

    useEffect(() => {
        openSidebar();
        analytics.logEvent('Users list opened');
    }, [])

    return (
        <div>
            <Segment clearing basic>
                <Button basic onClick={closeSidebar} key="close-event-list" floated="right" icon="x" />
                <Header floated="left" size="large">
                    Użytkownicy
                </Header>
            </Segment>
            <Segment clearing basic>
                <UsersList />
            </Segment>
        </div>
    );
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

const enhance = compose(
    firebaseConnect(),
    connect(({firebase: { auth, profile }}) => ({auth, profile}), mapDispatchToProps)
);

export default enhance(Users);
