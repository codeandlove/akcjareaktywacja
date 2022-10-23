import React, {useEffect} from 'react';
import {Button, Form, Header, Icon, Segment} from "semantic-ui-react";
import {bindActionCreators, compose} from "redux";
import * as actionCreators from "../../actions";
import {firebaseConnect} from "react-redux-firebase";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {LOGIN, REGISTER} from "../../routers";
import {analytics} from "../../../firebase/analytics";

const Unauthorized = (props) => {
    const {closeSidebar, openSidebar} = props;

    useEffect(() => {
        openSidebar();
        analytics.logEvent('Unauthorized access');
    }, [])

    return (
        <div >
            <Segment clearing basic>
                <Button basic onClick={closeSidebar} key="close-event-list" floated="right" icon="x" />
                <Header floated="left" size="large">
                    Dostęp niedozwolony
                </Header>
            </Segment>
            <Segment clearing basic >
                <p>
                    Niestety, tutaj dostęp mają jedynie zalogowani użytkownicy.
                </p>
            </Segment>
            <Segment textAlign="right">
                <Form>
                    <Form.Field>
                        <Button color="red" as={Link} to={`/${REGISTER}`}>
                            <Icon name="signup" />
                            Rejestracja
                        </Button>
                        <Button primary as={Link} to={`/${LOGIN}`}>
                            <Icon name="sign in" />
                            Zaloguj się
                        </Button>
                    </Form.Field>
                </Form>
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

export default enhance(Unauthorized);