import React, { Component } from "react";
import PropTypes from "prop-types";

import { firebaseConnect} from "react-redux-firebase";
import { compose } from "redux";
import { connect } from "react-redux";

import { Link } from "react-router-dom";

import "./Register.scss";

import { Header, Segment, Message, Form, Input, Checkbox, Button, Icon } from "semantic-ui-react";
import {LOGIN, USER} from "../../routers";
import {withGoogleReCaptcha} from "react-google-recaptcha-v3";
import {verifyCaptcha} from "../../utils";

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            messageType: null,
            terms: true,
            email: null,
            password: null,
            passwordConfirmation: null,
            passwordValidated: false,
            nick: null,
            success: false
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

        if(name === 'passwordConfirmation') {
            this.machPasswordConfirmation(event.target.value, this.state.password);
        } else if(name === 'password') {
            this.machPasswordConfirmation(event.target.value, this.state.passwordConfirmation);
        }
    };

    machPasswordConfirmation = (pass1, pass2) => {
        this.setState({
            messageType: pass1 !== pass2 ? 'create/password-does-not-mach' : null,
            passwordValidated:  pass1 === pass2
        })
    }

    renderMessage = () => {
        const { messageType } = this.state;

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
            case "create/password-does-not-mach":
                result = (
                    <Message warning>
                        <Message.Header>Błąd rejestracji</Message.Header>
                        <p>Wpisane hasła różnią się.</p>
                    </Message>
                );
                break;
            default:
                result = null;
                break;
        }

        return (result) ? <Segment clearing basic>{result}</Segment> : null;
    };

    toggleTerms = () => {
        this.setState(s => {
            return {
                terms: !s.terms
            }
        })
    };

    validateValues = (values) => {
        const result = values.filter(val => {
            return this.state[val] === false || this.state[val] === null || !this.state[val];
        });

        return result.length !== 0;
    };

    registerUser = () => {
        const { nick, email, password } = this.state;
        const { firebase } = this.props;

        if(this.validateValues(["email", "password", "passwordConfirmation", "passwordValidated", "nick", "terms"])) return;

        verifyCaptcha(this.props, 'registerForm').then(token => {
            if(token) {
                const usersRef = firebase.database().ref("/users");

                //Check if nick is unique
                usersRef.orderByChild("displayNick").equalTo(nick).once("value").then(snapshot => {
                    if(!snapshot.val()) {
                        this.props.firebase.createUser({
                            email: email,
                            password: password
                        }, {
                            email: email,
                            displayNick: nick
                        }).then(() => {
                            this.setState({
                                success: true
                            })
                        })
                    } else {
                        this.setState({
                            messageType: "create/nick-duplicated"
                        })
                    }
                });
            }
        });
    };

    renderRegisterForm = () => {
        const { terms } = this.state;

        return (
            <>
                <Segment clearing basic>
                    <Button basic onClick={() => this.props.close()} floated="right" icon="x" />
                    <Header floated="left" size="large">
                        Rejestracja
                    </Header>
                </Segment>
                {this.renderMessage()}
                <Segment clearing basic>
                    <h3>Wypełnij poniższe pola</h3>
                    <Form>
                        <Form.Field required>
                            <label>Twój nick</label>
                            <Input placeholder="Wpisz nick" type="nick" id="nick" name="nick" onChange={this.handleChange("nick")} />
                        </Form.Field>
                        <Form.Field required>
                            <label>Adres email</label>
                            <Input placeholder="Wpisz adres email" type="email" id="email" name="email" onChange={this.handleChange("email")} />
                        </Form.Field>
                        <Form.Field required>
                            <label>Hasło</label>
                            <Input placeholder="Wpisz  hasło" type="password" id="password" name="password" onChange={this.handleChange("password")} />
                        </Form.Field>
                        <Form.Field required>
                            <label>Powtórz hasło</label>
                            <Input placeholder="Wpisz ponownie hasło" type="password" id="password_confirmation" name="password_confirmation" onChange={this.handleChange("passwordConfirmation")} />
                        </Form.Field>
                        <Form.Field
                            control={Checkbox}
                            label={{ children: `Zgadzam się z ogólnymi warunkami serwisu.` }}
                            required
                            inline
                            defaultChecked={terms}
                            onChange={() => this.toggleTerms()}
                        />
                        <Form.Field>
                            <Button as={Link} to={`/${LOGIN}`} floated="left" >
                                Anuluj
                            </Button>
                            <Button primary onClick={this.registerUser} disabled={this.validateValues(["email", "password", "passwordConfirmation", "passwordValidated", "nick", "terms"])} floated="right" >
                                <Icon name="check" />
                                Wyślij
                            </Button>
                        </Form.Field>
                    </Form>
                </Segment>
            </>
        )
    }

    renderSuccessPage = () => {
        const { router } = this.context;

        return (
            <>
                <Segment clearing basic>
                    <Button basic onClick={() => this.props.close()} floated="right" icon="x" />
                    <Header floated="left" size="large">
                        Udało się!
                    </Header>
                </Segment>
                {this.renderMessage()}
                <Segment clearing basic>
                    <p>Konto zostało utworzone.</p>
                    <Button floated="right" onClick={() => router.history.push(`/${USER}`)} color="olive">
                        <Icon name="user" />
                        Twój profil
                    </Button>
                </Segment>
            </>
        )
    }

    render() {
        const { success } = this.state;
        return success ? this.renderSuccessPage() : this.renderRegisterForm();
    }
}

Register.contextTypes = {
    router: PropTypes.object
};

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth, profile } }) => ({ auth, profile }))
)(withGoogleReCaptcha(Register));