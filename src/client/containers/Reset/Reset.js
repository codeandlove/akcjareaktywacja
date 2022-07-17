import React, {Component, useEffect, useState} from "react";

import { firebaseConnect} from "react-redux-firebase";
import { compose } from "redux";
import { connect } from "react-redux";

import { Link } from "react-router-dom";

import "./Reset.scss";

import { Header, Segment, Message, Form, Input, Button, Icon } from "semantic-ui-react";
import { LOGIN } from "../../routers";
import {verifyCaptcha} from "../../utils";
import {withGoogleReCaptcha} from "react-google-recaptcha-v3";
import {useFormState} from "../../hooks";

const Reset = (props) => {
    const {toggleColumn, firebase, close } = props;
    const [messageType, setMessageType] = useState(null);
    const [formState, setFormState, handleChange, validateValues] = useFormState({
        email: null
    });

    const { email } = formState;

    useEffect(() => {
        toggleColumn(true);
    }, []);

    const renderMessage = () => {

        let result = null;

        switch(messageType) {
            case "auth/confirm-reset-password":
                result = (
                    <Message success>
                        <p>Sprawdź swoją skrzynkę pocztową i postępuj zgodnie z wytycznymi w wiadomości.</p>
                    </Message>
                );
                break;
            case "auth/user-not-found":
                result = (
                    <Message negative>
                        <p>Adres email nie został znaleziony.</p>
                    </Message>
                );
                break;
            default:
                result = null;
                break;
        }

        return (result) ? <Segment clearing basic>{result}</Segment> : null;
    };

    const resetPassword = () => {
        if(validateValues(["email"])) return;

        verifyCaptcha(props, 'resetPassword').then(token => {
            if(token) {
                firebase.resetPassword(email).then(() => {
                    setFormState({
                        email: null
                    })
                    setMessageType("auth/confirm-reset-password");
                }).catch(error => {
                    setMessageType(error.code);
                });
            }
        });
    };

    return (
        <>
            <Segment clearing basic>
                <Button basic onClick={close} floated="right" icon="x" />
                <Header floated="left" size="large">
                    Odzyskaj hasło
                </Header>
            </Segment>
            {renderMessage()}
            <Segment basic>
                <h3>Wypełnij poniższe pola</h3>
                <Form>
                    <Form.Field required>
                        <label>Adres email</label>
                        <Input placeholder="Wpisz adres email" type="email" id="email" name="email" onChange={handleChange("email")} />
                    </Form.Field>
                    <Form.Field>
                        <Button as={Link} to={`/${LOGIN}`} floated="left" >
                            Anuluj
                        </Button>
                        <Button primary onClick={resetPassword} disabled={validateValues(["email"])} floated="right" >
                            <Icon name="check" />
                            Wyślij
                        </Button>
                    </Form.Field>
                </Form>
            </Segment>
        </>
    );
}

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth, profile } }) => ({ auth, profile }))
)(withGoogleReCaptcha(Reset));