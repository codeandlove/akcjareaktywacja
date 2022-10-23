import React, {useEffect, useState} from "react";

import {firebaseConnect, isEmpty, isLoaded} from 'react-redux-firebase';
import {bindActionCreators, compose} from 'redux';
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

import "./Login.scss";

import { Header, Segment, Message, Form, Input, Button, Icon, Divider } from "semantic-ui-react";
import {REGISTER, RESET, ACCOUNT} from "../../routers";
import {verifyCaptcha} from "../../utils";
import {withGoogleReCaptcha} from "react-google-recaptcha-v3";
import {useFormState} from "../../hooks";
import {withRouter} from "react-router";
import InputPasswordPreview from "../../components/InputPasswordPreview/InputPasswordPreview";
import * as actionCreators from "../../actions";

const Login = (props) => {
    const {openSidebar, closeSidebar, firebase, history, auth} = props;
    const [messageType, setMessageType] = useState(null);
    const [formState, setFormState, handleChange, validateValues] = useFormState({
        email: null,
        password: null
    });

    const { email, password } = formState;

    useEffect(() => {
        openSidebar();
    }, []);

    useEffect(() => {
        if(!isEmpty(auth) && isLoaded(auth) && !auth.isAnonymous) {
            history.push(`/${ACCOUNT}`);
        }
    }, [auth])

    const renderMessage = () => {
        let result = null;

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

    const registerByProvider = provider => {
        verifyCaptcha(props, 'loginByProvider').then(token => {
            if(token) {
                firebase.login({ provider: provider, type: 'redirect' }).then(() => {
                    history.push(`/${ACCOUNT}`);
                })
            }
        });
    };

    const login = () => {
        verifyCaptcha(props, 'loginForm').then(token => {
            if(token) {
                firebase.login({
                    email: email,
                    password: password
                }).then(() => {
                    setFormState({
                        email: null,
                        password: null
                    });
                    history.push(`/${ACCOUNT}`);
                }).catch(res => {
                    const {code} = res.toJSON();
                    setMessageType(code);
                })
            }
        })
    };

    return (
        <>
            <Segment clearing basic>
                <Button basic onClick={closeSidebar} floated="right" icon="x" />
                <Header floated="left" size='large'>
                    Logowanie
                </Header>
            </Segment>
            {renderMessage()}
            <Segment basic clearing>
                <h3>Zaloguj się</h3>
                <Form>
                    <Form.Field required>
                        <label>Adres email</label>
                        <Input placeholder="Wpisz adres email" type="email" id="email" name="email" onChange={handleChange("email")} />
                    </Form.Field>
                    <Form.Field required>
                        <label>Hasło</label>
                        <InputPasswordPreview placeholder="Wpisz hasło" id="password" name="password" onChange={handleChange("password")} />
                    </Form.Field>
                    <Link to={`/${RESET}`}>Zresetuj swoje hasło</Link>
                    <Form.Field>
                        <Button primary onClick={login} disabled={validateValues(["email", "password"])} floated="right" >
                            <Icon name="sign in" />
                            Wyślij
                        </Button>
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
                <Button color='red' floated="right" onClick={() => registerByProvider('google')}>
                    <Icon name="google" />
                    Gmail
                </Button>
            </Segment>
        </>
    );
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth, profile } }) => ({ auth, profile }), mapDispatchToProps)
)(withGoogleReCaptcha(withRouter(Login)));