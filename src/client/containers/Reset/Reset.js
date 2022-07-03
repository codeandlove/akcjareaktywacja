import React, { Component } from "react";
import PropTypes from "prop-types";

import { firebaseConnect} from "react-redux-firebase";
import { compose } from "redux";
import { connect } from "react-redux";

import { Link } from "react-router-dom";

import "./Reset.scss";

import { Container, Header, Segment, Message, Form, Input, Button, Icon } from "semantic-ui-react";
import { LOGIN } from "../../routers";
import {verifyCaptcha} from "../../utils";
import {withGoogleReCaptcha} from "react-google-recaptcha-v3";

class Reset extends Component {
    constructor(props) {
        super(props);

        this.state = {
            messageType: null,
            email: null
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

    validateValues = (values) => {
        const result = values.filter(val => {
            return this.state[val] === false || this.state[val] === null || !this.state[val];
        });

        return result.length !== 0;
    };

    resetPassword = () => {
        const { email } = this.state;
        const { firebase } = this.props;

        if(this.validateValues(["email"])) return;

        verifyCaptcha(this.props, 'resetPassword').then(token => {
            if(token) {
                firebase.resetPassword(email).then(() => {
                    this.setState({
                        messageType: "auth/confirm-reset-password",
                        email: null
                    });
                }).catch(error => {
                    this.setState({
                        messageType: error.code
                    });
                });
            }
        });
    };

    render() {

        return (
            <>
                <Segment clearing basic>
                    <Button basic onClick={() => this.props.close()} floated="right" icon="x" />
                    <Header floated="left" size="large">
                        Odzyskaj hasło
                    </Header>
                </Segment>
                {this.renderMessage()}
                <Segment basic>
                    <h3>Wypełnij poniższe pola</h3>
                    <Form>
                        <Form.Field required>
                            <label>Adres email</label>
                            <Input placeholder="Wpisz adres email" type="email" id="email" name="email" onChange={this.handleChange("email")} />
                        </Form.Field>
                        <Form.Field>
                            <Button as={Link} to={`/${LOGIN}`} floated="left" >
                                Anuluj
                            </Button>
                            <Button primary onClick={this.resetPassword} disabled={this.validateValues(["email"])} floated="right" >
                                <Icon name="check" />
                                Wyślij
                            </Button>
                        </Form.Field>
                    </Form>
                </Segment>
            </>
        );
    }
}

Reset.contextTypes = {
    router: PropTypes.object
};

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth, profile } }) => ({ auth, profile }))
)(withGoogleReCaptcha(Reset));