import React, {useEffect} from 'react';
import {Button, Divider, Header, Icon, Message, Segment} from "semantic-ui-react";
import {analytics} from "../../../firebase/analytics";
import {bindActionCreators, compose} from "redux";
import * as actionCreators from "../../actions";
import {firebaseConnect, withFirebase} from "react-redux-firebase";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import AccountMessagesList from "../AccountMessagesList/AccountMessagesList";
import {USERS} from "../../routers";

const AccountMessagesDashboard = (props) => {
    const {closeSidebar, openSidebar, profile: {messages}, history} = props;

    useEffect(() => {
        openSidebar();
        analytics.logEvent('User opened own messages dashboard');
    }, []);

    return (
        <div>
            <Segment clearing basic>
                <Button basic onClick={closeSidebar} floated="right" icon="x" />
                <Header floated="left" size="large">
                    Wiadomości
                </Header>
            </Segment>
            <Segment clearing basic>
                <AccountMessagesList messages={messages} />
                <Divider/>
                <Button color="olive" floated="right" onClick={() => history.push(`/${USERS}`)}>
                    Użytkownicy <Icon name="arrow right" />
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
    firebaseConnect(),
    connect(({ firebase }) => ({
        auth: firebase.auth,
        profile: firebase.profile,
    })),
    connect(mapStateToProps, mapDispatchToProps)
);

export default enhance(withRouter(withFirebase(AccountMessagesDashboard)));