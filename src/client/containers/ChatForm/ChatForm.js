import React, { Component } from "react";

import { connect } from "react-redux";
import { compose } from "redux";
import { firebaseConnect, isEmpty, isLoaded } from "react-redux-firebase";

import moment from 'moment';

import ReCAPTCHA from "react-google-recaptcha";

import { Button, Form, Message, TextArea, Icon, Transition } from "semantic-ui-react";

import "./ChatForm.scss";
import {analytics} from "../../../firebase";

const MIN_TIME_OFFSET = 30000;

class ChatForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nick: null,
            messageType: null,
            message: null,
            toggleCaptcha: true,
            captcha: false,
            expanded: false,
            timestamp: null
        }
    }

    setUserNickname = () => {
        const { profile, auth } = this.props;

        if(!isEmpty(auth) && isLoaded(auth)) {
            if(auth.isAnonymous) return;

            if(!isEmpty(profile)) {
                this.setState({
                    nick: profile.displayNick || ""
                });
            }
        }
    };

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    };

    renderMessage = () => {
        const { messageType } = this.state;

        let result = null;

        switch(messageType) {
            case "nick/nick-exist":
                result = (
                    <Message
                        error
                        header='Błąd formularza'
                        content='Użytkownik o takim nicku już istnieje. Jeśli to Ty, zaloguj się aby korzystać z Twojego podpisu.'
                    />
                );
                break;
            case "chat/to-short-time-offset":
                result = (
                    <Message
                        error
                        header='Błąd wiadomości'
                        content={`Nie minęło 30 sekund od Twojego ostateniego wpisu. Pozostało jeszcze ${Math.round((MIN_TIME_OFFSET - (moment().valueOf() - this.state.timestamp)) / 1000)}s.`}
                    />
                );
                break;
            default:
                result = null;
                break;
        }

        return (result) ? result : null;
    };

    validateValues = (values) => {
        const result = values.filter(val => {
            return this.state[val] === false || this.state[val] === null || !this.state[val];
        });

        return result.length !== 0;
    };

    handleSave = () => {

        const { nick, message, timestamp } = this.state;

        const { firebase, auth } = this.props;

        if(this.validateValues(["nick", "message", "captcha"])) return;

        const messageTimestamp =  moment().valueOf();

        let preparedData = {
            nick: nick,
            message: message,
            timestamp: messageTimestamp
        };

        //Check if need to enable Captcha (to short time between save events)
        let duration = messageTimestamp - timestamp;

        if(!!timestamp && duration < MIN_TIME_OFFSET) {
            this.setState({
                messageType: "chat/to-short-time-offset"
            });
            return;
        }

        if(!isEmpty(auth) && isLoaded(auth)) {
            preparedData = {...preparedData, user: auth.uid};
            firebase.push('chat', preparedData, () => {
                this.clearForm();
            });

        } else {
            const usersRef = firebase.database().ref("/users");

            //Check if nick is unique
            usersRef.orderByChild("displayNick").equalTo(nick).once("value").then(snapshot => {
                if(!snapshot.val()) {
                    firebase.auth().signInAnonymously().then(res => {
                        preparedData = {...preparedData, user: res.user.uid}

                        firebase.push('chat', preparedData, () => {
                            this.clearForm();
                        });
                    });
                } else {
                    this.setState({
                        messageType: "nick/nick-exist"
                    })
                }
            });
        }

        this.setDuration();

        this.toggleCaptcha(true);
    };

    setDuration = () => {
        this.setState({
            timestamp: moment().valueOf()
        })
    };

    toggleCaptcha = toggle => {
        this.setState({
            toggleCaptcha: toggle
        })
    };

    clearForm = () => {
        const { toggleCaptcha } = this.state;

        if(toggleCaptcha) {
            this.recapcha.reset();

            this.setState({
                captcha: false
            });
        }

        this.message['ref'].current.value = "";

        this.setState({
            message: null,
            validated: false
        });

        this.collapseForm();
    };

    captchaVerifyHandler = () => {
        this.setState({
            captcha: true
        })
    };

    expandForm = () => {
        this.setUserNickname();
        setTimeout(this.props.scrollToBottom(), 2500);

        this.setState({
            expanded: true
        })

        analytics.logEvent('User opened a chat form');
    };

    collapseForm = () => {
        setTimeout(this.props.scrollToBottom(), 2500);

        this.setState({
            expanded: false
        })
    };

    render() {

        const { expanded, messageType, nick, toggleCaptcha } = this.state;

        const { profile } = this.props;

        return (
            <Form onFocus={this.expandForm} error={messageType !== null} onSubmit={this.handleSave}>
                <Form.Field>
                    <label>Wiadomość</label>
                    <TextArea autoHeight rows={3} ref={el => this.message = el} placeholder="Wiadomość" name="message" onChange={this.handleChange("message")} />
                </Form.Field>
                <Transition visible={expanded} animation='fade up' duration={500}>
                    <div>

                        {isEmpty(profile) ?
                            (
                                <Form.Field>
                                    <label>Podpis</label>
                                    <input ref={el => this.nick = el} label="Podpis" id="nick" name="nick" placeholder="Twój podpis" onChange={this.handleChange("nick")} />
                                </Form.Field>
                            ) : (
                                <Form.Field>
                                    <label>Podpis</label>
                                    <input value={nick} name="nick" disabled onChange={() => null}/>
                                </Form.Field>
                            )
                        }

                        {this.renderMessage()}

                        {
                            toggleCaptcha ? (
                                <Form.Field>
                                    <ReCAPTCHA
                                        ref={el => this.recapcha = el}
                                        sitekey={process.env.REACT_APP_RECAPTCHA_API_V2}
                                        onChange={this.captchaVerifyHandler}
                                    />
                                </Form.Field>
                            ) : null
                        }

                        <Button onClick={this.clearForm} floated="left">
                            <Icon name="x" />
                            Anuluj
                        </Button>

                        <Button disabled={this.validateValues(["nick", "message", "captcha"])} color="olive" floated="right">
                            <Icon name="check" />
                            Wyślij
                        </Button>
                    </div>
                </Transition>
            </Form>
        )
    }
}

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth, profile } }) => ({ auth, profile }))
)(ChatForm);
