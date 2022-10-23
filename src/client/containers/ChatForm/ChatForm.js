import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { firebaseConnect, isEmpty, isLoaded } from "react-redux-firebase";
import moment from 'moment';
import {Button, Form, Message, Icon, Transition} from "semantic-ui-react";
import "./ChatForm.scss";
import {analytics} from "../../../firebase/analytics";
import {
    encryptMessage,
    findPhoneNumber,
    findSwearWord,
    findUrlString,
    replaceBasicEmojiInText,
    verifyCaptcha
} from "../../utils";
import {withGoogleReCaptcha} from "react-google-recaptcha-v3";
import {pushNotification} from "../../notifications";
import ChatTextArea from "../ChatTextArea/ChatTextArea";
import {ACCOUNT} from "../../routers";
import {withRouter} from "react-router";

const MIN_TIME_OFFSET = process.env.NODE_ENV === 'production' ? 30000 : 0;

const ChatForm = (props) => {
    const {firebase, profile, auth, suggestions, scrollToBottom, type, id, notify, encryptPass} = props;
    const [formState, setFormState] = useState({
        nick: null,
        message: ''
    });
    const [messageType, setMessageType] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [timestamp, setTimestamp] = useState(false);
    const chatType = type || 'chat';

    useEffect(() => {
        setUserNickname();
    }, [auth]);

    useEffect(() => {
        setFormState({
            ...formState,
            message: replaceBasicEmojiInText(formState.message)
        })
    }, [formState.message])

    const setUserNickname = () => {
        if(!isEmpty(auth) && isLoaded(auth)) {
            if(auth.isAnonymous) return;

            if(!isEmpty(profile)) {
                setFormState({
                    ...formState,
                    nick: profile.displayNick || ""
                })
            }
        }
    };

    const handleChange = name => event => {
        setFormState({
            ...formState,
            [name]: event.target.value
        })
    };

    const renderMessage = () => {
        let result;

        switch(messageType) {
            case "nick/nick-exist":
                result = (
                    <Message
                        error
                        header='Błąd formularza'
                        content='Użytkownik o takim nicku już istnieje. Jeśli to Ty zaloguj się, aby korzystać z Twojego podpisu.'
                    />
                );
                break;
            case "chat/to-short-time-offset":
                result = (
                    <Message
                        error
                        header='Błąd wiadomości'
                        content={`Nie minęło 30 sekund od Twojego ostateniego wpisu. Pozostało jeszcze ${Math.round((MIN_TIME_OFFSET - (moment().valueOf() - timestamp)) / 1000)}s.`}
                    />
                );
                break;
            case "found-url-string":
                result = (
                    <Message
                        color="orange"
                        size="mini"
                        content="Uwaga na roboty! 🤖 - Treść zawiera adres URL. Zmodyfikuj treść aby opublikować komentarz."
                    />
                );
                break;
            case "found-phone-string":
                result = (
                    <Message
                        color="orange"
                        size="mini"
                        content="Uwaga na roboty 🤖🤖🤖! Nie podawaj numeru telefonu w treści komentarza."
                    />
                );
                break;
            case "found-swear-word":
                result = (
                    <Message
                        color="orange"
                        size="mini"
                        content="Wprowadzona treść zawiera niestosowne słowa. Proszę poprawić treść aby była bardziej przyjazna dla innych użytkowników."
                    />
                );
                break;
            default:
                result = null;
                break;
        }

        return result;
    };

    const validateValues = (values) => {
        const result = values.filter(val => {
            return formState[val] === false || formState[val] === null || !formState[val];
        });

        return result.length !== 0;
    };

    const validateExcludes = (values) => {
        const result = values.filter(val => {
            if(formState[val] && typeof formState[val] === 'string') {
                if(findUrlString(formState[val])) {
                    setMessageType("found-url-string");
                    return true;
                }

                if(val !== "contact" && findPhoneNumber(formState[val])) {
                    setMessageType("found-phone-string");
                    return true;
                }

                if(findSwearWord(formState[val])) {
                    setMessageType("found-swear-word");
                    return true;
                }

                return false;
            }

            return false;
        });

        return result.length !== 0;
    }

    const handleSave = () => {
        if(validateValues(["nick", "message"])) return;
        if(validateExcludes(["nick", "message"])) return;

        verifyCaptcha(props, 'chatMessage').then(token => {
            if(token) {
                const messageTimestamp =  moment().valueOf();
                const {nick, message} = formState;

                let chatRef = chatType ?
                    firebase.database().ref(chatType)
                    : firebase.database().ref('chat');

                if(id) {
                    chatRef = chatRef.child(`${id}/chat`);
                }

                let preparedData = {
                    nick: nick,
                    message: !!encryptPass ? encryptMessage(message, encryptPass) : message,
                    timestamp: messageTimestamp
                };

                //Check if need to enable Captcha (to short time between save events)
                let duration = messageTimestamp - timestamp;

                if(!!timestamp && duration < MIN_TIME_OFFSET) {
                    setMessageType("chat/to-short-time-offset");
                    return;
                }

                if(!isEmpty(auth) && isLoaded(auth)) {
                    preparedData = {...preparedData, user: auth.uid};
                    if(auth.isAnonymous) {
                        const usersRef = firebase.database().ref("/users");
                        //Check if nick is unique
                        usersRef.orderByChild("displayNick").equalTo(nick).once("value").then(snapshot => {
                            if (snapshot.val()) {
                                setMessageType("nick/nick-exist");
                            } else {
                                chatRef.push(preparedData, () => {
                                    notify && pushNotification(`Nowa wiadomość od ${nick}`, `${message}`, 'chat');
                                    clearForm();
                                });
                            }
                        });
                    } else {
                        chatRef.push(preparedData, () => {
                            notify && pushNotification(`Nowa wiadomość od ${nick}`, `${message}`, 'chat');
                            clearForm();
                        });
                    }
                } else {
                    const usersRef = firebase.database().ref("/users");

                    //Check if nick is unique
                    usersRef.orderByChild("displayNick").equalTo(nick).once("value").then(snapshot => {
                        if(!snapshot.val()) {
                            firebase.auth().signInAnonymously().then(res => {
                                preparedData = {...preparedData, user: res.user.uid}

                                chatRef.push(preparedData, () => {
                                    notify && pushNotification(`Nowa wiadomość od ${nick}`, `${message}`, 'chat');
                                    clearForm();
                                });
                            });
                        } else {
                            setMessageType("nick/nick-exist");
                        }
                    });
                }
                setDuration();
            }
        })
    };

    const setDuration = () => {
        setTimestamp(moment().valueOf())
    };

    const clearForm = () => {
        setFormState({
            ...formState,
            message: ''
        })
        setMessageType(null);
        collapseForm();
    };

    const expandForm = () => {
        setUserNickname();

        if(scrollToBottom){
            setTimeout(scrollToBottom(), 2500);
        }
        setExpanded(true);

        analytics.logEvent('User opened a chat form');
    };

    const collapseForm = () => {
        if(scrollToBottom){
            setTimeout(scrollToBottom(), 2500);
        }
        setExpanded(false);
    };

    const {nick, message} = formState;
    const {history} = props;

    return (
        <Form onFocus={expandForm} error={messageType !== null} onSubmit={handleSave}>
            <Form.Field>
                <label>Wiadomość</label>
                <ChatTextArea value={message} data={suggestions} onChange={handleChange("message")} />
            </Form.Field>
            <Transition visible={expanded} animation='fade up' duration={500}>
                <div>
                    <Form.Field>
                        <label>Podpis</label>
                        {
                            isEmpty(profile) ?
                            (
                                <input id="nick" name="nick" placeholder="Twój podpis" onChange={handleChange("nick")} />
                            ) : (
                                <>
                                    {
                                        !nick ? (
                                            <Button fluid basic color="olive" type="button" icon='user' content="Dodaj nick" onClick={() => {
                                                history.push(`/${ACCOUNT}`);
                                            }} />
                                        ) : (
                                            <input value={nick} name="nick" disabled readOnly onChange={() => null} />
                                        )
                                    }
                                </>
                            )
                        }
                    </Form.Field>
                    {renderMessage()}
                    <Button type="button" onClick={clearForm}>
                        <Icon name="x" />
                        Anuluj
                    </Button>
                    <Button type="submit" disabled={validateValues(["nick", "message"])} primary floated="right">
                        <Icon name="check" />
                        Wyślij
                    </Button>
                </div>
            </Transition>
        </Form>
    )
}

export default compose(
    firebaseConnect(),
    connect(({ firebase: { auth, profile } }) => ({ auth, profile }))
)(withRouter(withGoogleReCaptcha(ChatForm)));
