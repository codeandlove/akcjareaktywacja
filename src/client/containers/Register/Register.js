import React, {useEffect, useState} from "react";

import { firebaseConnect} from "react-redux-firebase";
import {bindActionCreators, compose} from "redux";
import { connect } from "react-redux";

import { Link } from "react-router-dom";

import "./Register.scss";

import {Header, Segment, Message, Form, Input, Checkbox, Button, Icon} from "semantic-ui-react";
import {LOGIN, USER} from "../../routers";
import {withGoogleReCaptcha} from "react-google-recaptcha-v3";
import {verifyCaptcha} from "../../utils";
import {useFormState} from "../../hooks";
import {withRouter} from "react-router";
import InputPasswordPreview from "../../components/InputPasswordPreview/InputPasswordPreview";
import * as actionCreators from "../../actions";

const Register = (props) => {
    const {openSidebar, closeSidebar, firebase, history} = props;
    const [registerFormPassed, setRegisterFormPassed] = useState(false);
    const [messageType, setMessageType] = useState(null);
    const [formState, setFormState, handleChange, validateValues] = useFormState({
        email: null,
        password: null,
        passwordConfirmation: null,
        passwordValidated: null,
        nick: null,
        terms: false
    });

    const { email, password, passwordConfirmation, passwordValidated, nick, terms } = formState;

    useEffect(() => {
        openSidebar();
    }, []);

    useEffect(() => {
        if(!!password && !!passwordConfirmation) {
            setFormState({
                passwordValidated: password === passwordConfirmation
            })
        } else {
            setFormState({
                passwordValidated: null
            })
        }
    }, [password, passwordConfirmation])

    useEffect(() => {
        setMessageType(passwordValidated === false ? "create/password-does-not-match" : null)
    }, [passwordValidated])

    const renderMessage = () => {
        let result = null;

        switch(messageType) {
            case "create/nick-duplicated":
                result = (
                    <Message negative>
                        <Message.Header>Błąd rejestracji</Message.Header>
                        <p>Użytkownik o takim nicku już istnieje.</p>
                    </Message>
                );
                break;
            case "create/password-does-not-match":
                result = (
                    <Message warning>
                        <Message.Header>Błąd rejestracji</Message.Header>
                        <p>Wpisane hasła różnią się.</p>
                    </Message>
                );
                break;
            case "create/captcha-not-verified":
                result = (
                    <Message warning>
                        <Message.Header>Błąd rejestracji</Message.Header>
                        <p>Niepowodzenie weryfikacji Captcha. Możliwe, że jesteś robotem.</p>
                    </Message>
                );
                break;
            case "auth/email-already-in-use":
                result = (
                    <Message negative>
                        <Message.Header>Błąd rejestracji</Message.Header>
                        <p>Użytkownik o takim adresie email już istnieje.</p>
                    </Message>
                )
                break;
            case "auth/weak-password":
                result = (
                    <Message negative>
                        <Message.Header>Błąd rejestracji</Message.Header>
                        <p>Zlituj się, daj lepsze hasło. 6 znaków to minimum.</p>
                    </Message>
                )
                break;
            default:
                result = null;
                break;
        }

        return (result) ? <Segment clearing basic>{result}</Segment> : null;
    };

    const registerUser = () => {
        if(validateValues(["email", "password", "passwordConfirmation", "passwordValidated", "nick", "terms"])) return;

        setMessageType(null);

        verifyCaptcha(props, 'registerForm').then(token => {
            if(token) {
                const usersRef = firebase.database().ref("/users");

                //Check if nick is unique
                usersRef.orderByChild("displayNick").equalTo(nick).once("value").then(snapshot => {
                    if(!snapshot.val()) {
                        firebase.createUser({
                            email: email,
                            password: password
                        }, {
                            email: email,
                            displayNick: nick
                        }).then(() => {
                            setRegisterFormPassed(true)
                        }).catch((res) => {
                            const {code} = res.toJSON();
                            setMessageType(code);
                        })
                    } else {
                        setMessageType("create/nick-duplicated");
                    }
                });
            } else {
                setMessageType("create/captcha-not-verified");
            }
        });
    };

    const renderRegisterForm = () => {
        return (
            <>
                <Segment clearing basic>
                    <Button basic onClick={closeSidebar} floated="right" icon="x" />
                    <Header floated="left" size="large">
                        Rejestracja
                    </Header>
                </Segment>
                {renderMessage()}
                <Segment clearing basic>
                    <h3>Wypełnij poniższe pola</h3>
                    <Form>
                        <Form.Field required>
                            <label>Twój nick</label>
                            <Input placeholder="Wpisz nick" type="nick" id="nick" name="nick" onChange={handleChange("nick")} />
                        </Form.Field>
                        <Form.Field required>
                            <label>Adres email</label>
                            <Input placeholder="Wpisz adres email" type="email" id="email" name="email" onChange={handleChange("email")} />
                        </Form.Field>
                        <Form.Field required>
                            <label>Hasło</label>
                            <InputPasswordPreview placeholder="Wpisz hasło" id="password" name="password" onChange={handleChange("password")} />
                        </Form.Field>
                        <Form.Field required>
                            <label>Powtórz hasło</label>
                            <InputPasswordPreview placeholder="Wpisz ponownie hasło" id="password_confirmation" name="password_confirmation" onChange={handleChange("passwordConfirmation")} />
                        </Form.Field>
                        <Form.Field required>
                            <Checkbox label="Zgadzam się z ogólnymi warunkami serwisu." toggle
                              onChange={handleChange("terms")}
                              defaultChecked={terms}/>
                        </Form.Field>
                        <Form.Field>
                            <Button as={Link} to={`/${LOGIN}`} floated="left" >
                                Anuluj
                            </Button>
                            <Button primary onClick={registerUser} disabled={validateValues(["email", "password", "passwordConfirmation", "passwordValidated", "nick", "terms"])} floated="right" >
                                <Icon name="check" />
                                Wyślij
                            </Button>
                        </Form.Field>
                    </Form>
                </Segment>
            </>
        )
    }

    const renderSuccessPage = () => {
        return (
            <>
                <Segment clearing basic>
                    <Button basic onClick={closeSidebar} floated="right" icon="x" />
                    <Header floated="left" size="large">
                        Udało się!
                    </Header>
                </Segment>
                {renderMessage()}
                <Segment clearing basic>
                    <p>Konto zostało utworzone.</p>
                    <Button floated="right" onClick={() => history.push(`/${USER}`)} color="olive">
                        <Icon name="user" />
                        Twój profil
                    </Button>
                </Segment>
            </>
        )
    }

    return registerFormPassed ? renderSuccessPage() : renderRegisterForm();
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth, profile } }) => ({ auth, profile }), mapDispatchToProps)
)(withGoogleReCaptcha(withRouter(Register)));