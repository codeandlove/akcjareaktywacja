import React, { Component } from "react";
import PropTypes from "prop-types";

import { firebaseConnect} from 'react-redux-firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

import "./Login.scss";

import { Container, Header, Segment, Message, Form, Input, Button, Icon, Divider } from "semantic-ui-react";
import {REGISTER, RESET, USER} from "../../routers";
import {verifyCaptcha} from "../../utils";
import {withGoogleReCaptcha} from "react-google-recaptcha-v3";

class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            messageType: null,
            login: null,
            password: null
        }
    }

    componentDidMount() {
        const {toggleColumn} = this.props;
        toggleColumn(true);
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    };

    renderMessage = () => {
        const { messageType } = this.state;
        let result;

        switch(messageType) {
            case "auth/wrong-password":
                result = (
                    <Message negative>
                        <Message.Header>Błąd logowania</Message.Header>
                        <p>Twoje hasło lub email są niepoprawne. Spróbuj ponownie.</p>
                    </Message>
                );
                break;
            case "auth/user-not-found":
                result = (
                    <Message negative>
                        <Message.Header>Błąd logowania</Message.Header>
                        <p>Brak użytkownika o takim adresie email.</p>
                    </Message>
                );
                break;
            default:
                result = null;
                break;
        }

        return (result) ? <Segment clearing basic>{result}</Segment> : null;
    };

    registerProviderEvent = provider => {
        const { router } = this.context;

        verifyCaptcha(this.props, 'loginByProvider').then(token => {
            if(token) {
                this.props.firebase.login({ provider: provider, type: 'redirect' }).then(() => {
                    router.history.push(`/${USER}`);
                })
            }
        });
    };

    loginEvent = () => {
        const { router } = this.context;
        const { email, password } = this.state;

        verifyCaptcha(this.props, 'loginForm').then(token => {
            if(token) {
                this.props.firebase.login({
                    email: email,
                    password: password
                }).then(() => {
                    router.history.push(`/${USER}`);
                }).catch(error => {
                    this.setState({
                        messageType: error.code
                    });
                })
            }
        })
    };

    render() {
        return (
            <>
                <Segment clearing basic>
                    <Button basic onClick={() => this.props.close()} floated="right" icon="x" />
                    <Header floated="left" size='large'>
                        Logowanie
                    </Header>
                </Segment>
                {this.renderMessage()}
                <Segment basic clearing>
                    <h3>Zaloguj się</h3>
                    <Form>
                        <Form.Field required>
                            <label>Adres email</label>
                            <Input placeholder="Wpisz adres email" type="email" id="email" name="email" onChange={this.handleChange("email")} />
                        </Form.Field>
                        <Form.Field required>
                            <label>Hasło</label>
                            <Input placeholder="Wpisz swoje hasło" type="password" id="password" name="password" onChange={this.handleChange("password")} />
                        </Form.Field>
                        <Link to={`/${RESET}`}>Zresetuj swoje hasło</Link>
                        <Form.Field control={Button} primary onClick={this.loginEvent} floated="right">
                            <Icon name="sign in" />
                            Zaloguj się
                        </Form.Field>
                    </Form>
                </Segment>
                <Divider horizontal>Lub</Divider>
                <Segment basic clearing>
                    <h3>Zarejestruj się</h3>
                    <p>Nie masz jeszcze konta? Zarejestruj się już dziś!</p>
                    <Button primary floated="left" as={Link} to={`/${REGISTER}`}>
                        <Icon name="signup" />
                        Rejestracja
                    </Button>
                    <Form.Field control={Button} color="red" onClick={() => this.registerProviderEvent('google')} floated="right">
                        <Icon name="google" />
                        Gmail
                    </Form.Field>
                </Segment>
            </>
        );
    }
}

Login.contextTypes = {
    router: PropTypes.object
};

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth, profile } }) => ({ auth, profile }))
)(withGoogleReCaptcha(Login));