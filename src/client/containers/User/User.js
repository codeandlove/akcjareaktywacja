import React, { Component } from "react";

import {firebaseConnect, isEmpty} from 'react-redux-firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';

import Uploader from './../Uploader/Uploader';

import ReCAPTCHA from "react-google-recaptcha";

import avatarPlaceholder from "./../../../assets/profile_avatar.png";

import "./User.scss";

import {
    Container,
    Header,
    Segment,
    Form,
    Input,
    Button,
    Icon,
    Message,
    Image,
    Tab,
    Dimmer,
    Loader
} from "semantic-ui-react";
import Avatar from "../../components/Avatar/Avatar";
import PropTypes from "prop-types";

class User extends Component {
    constructor(props) {
        super(props);

        this.state = {
            messageType: null,
            email: null,
            password: null,
            nick: null,
            avatarImage: null,
            updateAvatar: false,
            captcha: false,
            validated: false
        }
    }

    componentDidMount() {
        const {toggleColumn} = this.props;
        toggleColumn(true);
    }

    componentWillReceiveProps(props) {
        const { auth, profile } = props;

        if(auth.isLoaded && !auth.isEmpty) {
            this.setState({
                nick: profile.displayNick,
                avatarImage: profile.avatarImage
            })
        }
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    };

    captchaVerifyHandler = () => {
        this.setState({
            captcha: true
        })
    };

    renderMessage = () => {
        const { messageType } = this.state;

        let result = null;

        switch(messageType) {
            case "create/profile-updated":
                result = (
                    <Message positive>
                        <Message.Header>Zapisano</Message.Header>
                        <p>Twój profil został zaktualizowany.</p>
                    </Message>
                );
                break;
            case "create/nick-duplicated":
                result = (
                    <Message negative>
                        <Message.Header>Błąd aktualizacji profilu</Message.Header>
                        <p>Użytkownik o takim nicku już istnieje.</p>
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

    logoutEvent = () => {
        this.props.firebase.logout();
    };

    setAvatarImage = (data) => {
        this.setState({
            avatarImage: data,
            updateAvatar: true
        })
    }

    updateProfile = () => {
        const { auth, firebase } = this.props;
        const { nick, avatarImage } = this.state;

        if(this.validateValues(["nick", "updateAvatar", "captcha"])) return;

        const usersRef = firebase.database().ref('/users');

        //Check if nick is unique
        usersRef.orderByChild('displayNick').equalTo(nick).once("value").then(snapshot => {

            const isItMe = auth.uid === Object.keys(snapshot.val())[0];

            if(!snapshot.val() || isItMe) {
                this.props.firebase.update(`users/${auth.uid}`, {
                    displayNick: nick,
                    avatarImage: avatarImage
                }, () => {
                    this.setState({
                        messageType: "create/profile-updated",
                        captcha: false,
                        validated: false
                    })
                });
            } else {
                this.setState({
                    messageType: "create/nick-duplicated"
                })
            }
        });
    };

    userWelcome = () => {
        const { auth, profile } = this.props;
        const { nick } = this.state;

        return (
            <Tab.Pane clearing>
                <Container textAlign='center'>
                    <Avatar size="small"/>
                    <h3>Witaj, {nick || profile.displayNick || auth.displayName}</h3>
                </Container>
            </Tab.Pane>
        )
    };

    userSettings = () => {
        const { auth, profile } = this.props;
        const { nick, avatarImage, uploader, messageType } = this.state;

        return (
            <Tab.Pane clearing>
                <Header>
                    <Image src={avatarImage || auth.photoURL || avatarPlaceholder} size='mini' avatar /> {nick || auth.displayName}
                </Header>
                <Form>
                    <Form.Field>
                        <label>Avatar</label>
                        <Uploader open={uploader} setAvatarImage={avatarImage => this.setAvatarImage(avatarImage)}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Nick</label>
                        <Input ref={el => this.nick = el} placeholder="Wpisz nick" type="text" id="nick" name="nick" value={nick || profile.displayNick || ""} onChange={this.handleChange("nick")} />
                    </Form.Field>
                    <Form.Field>
                        <ReCAPTCHA
                            ref="recaptcha"
                            sitekey={process.env.REACT_APP_RECAPTCHA_API_V2}
                            onChange={this.captchaVerifyHandler}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Button floated="right" color="olive" disabled={this.validateValues(["nick", "captcha"]) || messageType === "nick/nick-exist"} onClick={this.updateProfile}>
                            <Icon name="check" />
                            Zapisz
                        </Button>
                    </Form.Field>
                </Form>
            </Tab.Pane>
        )
    };

    userLogout = () => {
        return (
            <Tab.Pane clearing>
                <Button color="red" onClick={() => this.logoutEvent()} floated="right" >
                    <Icon name="sign out" />
                    Wyloguj się
                </Button>
            </Tab.Pane>
        )
    };

    render() {
        const { auth, profile } = this.props;

        if(!profile.isLoaded) {
            return (
                <Dimmer active inverted>
                    <Loader size="large">Proszę czekać...</Loader>
                </Dimmer>
            )
        }

        const panes = [
            { menuItem: 'Witaj', render: this.userWelcome },
            { menuItem: 'Twoje konto', render: this.userSettings  },
            { menuItem: 'Wyloguj się', render: this.userLogout }
        ];

        return (
            <Container>
                <Segment clearing basic>
                    <Button basic onClick={() => this.props.close()} floated="right" icon="x" />
                    <Header floated="left" size='large'>
                        Witaj, {profile.displayNick || auth.displayName}!
                    </Header>
                </Segment>
                {this.renderMessage()}
                <Segment basic>
                    <Tab panes={panes} />
                </Segment>
            </Container>
        )
    }
}


Uploader.propTypes = {
    firebase: PropTypes.object.isRequired
};

const enhance = compose(
    firebaseConnect(),
    connect(({firebase: { auth, profile }}) => ({auth, profile}))
);

export default enhance(User);
