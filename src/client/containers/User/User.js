import React, {useEffect, useState} from "react";

import {firebaseConnect, isEmpty} from 'react-redux-firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';

import Uploader from './../Uploader/Uploader';

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
    Loader, Checkbox, Modal
} from "semantic-ui-react";
import Avatar from "../../components/Avatar/Avatar";
import {withGoogleReCaptcha} from "react-google-recaptcha-v3";
import {verifyCaptcha} from "../../utils";
import {useFormState} from "../../hooks";

const User = props => {
    const {profile, auth, uploader, close, toggleColumn, firebase} = props;
    const [messageType, setMessageType] = useState(null);
    const [avatarImage, setAvatarImage] = useState(null);

    const [formState, setFormState, handleChange, validateValues] = useFormState({
        nick: null,
        avatar: null,
        subscriptions: null
    });

    const { nick, avatar, subscriptions } = formState;

    useEffect(() => {
        toggleColumn(true);
    }, [])

    useEffect(() => {
        if(!isEmpty(profile)) {
            const {displayNick, avatarImage, avatarUrl, subscriptions} = profile;
            setFormState({
                nick: displayNick,
                avatar: avatarImage || avatarUrl,
                subscriptions: subscriptions === undefined ? false : subscriptions
            });
        }
    }, [profile]);

    if(!profile.isLoaded) {
        return (
            <Dimmer active inverted>
                <Loader size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    const renderMessage = () => {
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
    }

    const userWelcome = () => {
        return (
            <Tab.Pane clearing>
                <Container textAlign='center'>
                    <Avatar size="small"/>
                    {
                        !!nick ? (
                            <h3>Witaj, {nick}!</h3>
                        ) : (
                            <>
                                <h3>Witaj nieznajomy!</h3>
                                <p>Uzupełnij swój profil</p>
                            </>
                        )
                    }
                </Container>
            </Tab.Pane>
        )
    };

    const userSettings = () => {
        return (
            <Tab.Pane clearing>
                <Header>
                    <Image src={avatar || avatarPlaceholder} size='mini' avatar /> {!!nick ? nick : ''}
                </Header>
                <Form>
                    <Form.Field>
                        <label>Avatar</label>
                        <Uploader open={uploader} setAvatarImage={avatarImage => updateAvatarImage(avatarImage)}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Nick</label>
                        <Input placeholder="Wpisz nick" type="text" id="nick" name="nick" value={nick || ""} onChange={handleChange("nick")} />
                    </Form.Field>
                    <Form.Field>
                        <label>Powiadomienia</label>
                        <Checkbox label="Chcę otrzymywać powiadomienia o nowych aktywnościach." toggle
                                  onChange={handleChange("subscriptions")}
                                  defaultChecked={subscriptions}/>
                    </Form.Field>
                    <Form.Field>
                        <Button floated="right" color="olive" disabled={validateValues(["nick"]) || messageType === "nick/nick-exist"} onClick={saveProfile}>
                            <Icon name="check" />
                            Zapisz
                        </Button>
                    </Form.Field>
                </Form>
            </Tab.Pane>
        )
    };

    const userLogout = () => {
        return (
            <Tab.Pane clearing>
                <Button color="red" onClick={logout} floated="right" >
                    <Icon name="sign out" />
                    Wyloguj się
                </Button>
            </Tab.Pane>
        )
    }

    const panes = [
        { menuItem: 'Witaj', render: userWelcome },
        { menuItem: 'Twoje konto', render: userSettings },
        { menuItem: 'Wyloguj się', render: userLogout }
    ];

    const logout = () => {
        firebase.logout();
    }

    const updateAvatarImage = (data) => {
        setAvatarImage(data);
    }

    const saveProfile = () => {
        if(validateValues(["nick"])) return;

        verifyCaptcha(props, 'updateUser').then(token => {
            if(token) {
                const usersRef = firebase.database().ref('/users');

                //Check if nick is unique
                usersRef.orderByChild('displayNick').equalTo(nick).once('value').then(snapshot => {
                    const isItMe = auth.uid === (snapshot.val() && Object.keys(snapshot.val())[0]);

                    if(!snapshot.val() || isItMe) {
                        let data = {
                            displayNick: nick
                        }

                        if(subscriptions) {
                            data = {
                                ...data,
                                subscriptions: subscriptions
                            }
                        }

                        if(avatarImage) {
                            data = {
                                ...data,
                                avatarImage: avatarImage
                            }
                        }

                        firebase.update(`users/${auth.uid}`, data, () => {
                            setMessageType("create/profile-updated")
                        });
                    } else {
                        setMessageType("create/nick-duplicated")
                    }
                });
            }
        })
    }

    return (
        <>
            <Segment clearing basic>
                <Button basic onClick={close} floated="right" icon="x" />
                <Header floated="left" size='large'>
                    {
                        !!nick ? (
                            <>Witaj, {nick}!</>
                        ) : (
                            <>
                                Witaj nieznajomy!
                            </>
                        )
                    }
                </Header>
            </Segment>
            {renderMessage()}
            <Segment basic>
                <Tab panes={panes} />
            </Segment>
            <UpdateNickModal {...props} formState={formState} setFormState={data => setFormState(data)} saveProfile={saveProfile} renderMessage={renderMessage} />
        </>
    )
}

const UpdateNickModal = props => {
    const {profile, formState: {nick}, setFormState, saveProfile, renderMessage} = props;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if(!isEmpty(profile)) {
            const {displayNick} = profile;
            setOpen(!displayNick);
        }
    }, [profile]);

    return(
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            closeOnDimmerClick={false}
            closeOnEscape={false}
            closeOnDocumentClick={false}
            closeOnPortalMouseLeave={false}
            closeOnTriggerBlur={false}
            closeOnTriggerMouseLeave={false}
            closeOnTriggerClick={false}
        >
            <Header icon >
                Wpisz swój nowy nick
            </Header>
            <Modal.Content>
                {renderMessage()}
                <Form>
                    <Form.Field>
                        <label>Nick</label>
                        <Input placeholder="Wpisz nick" type="text" id="nick" name="nick" value={nick || ""}
                           onChange={e => setFormState({
                                nick: e.target.value
                            })}
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color='olive' disabled={!nick} onClick={saveProfile}>
                    <Icon name='checkmark' /> Zapisz
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

const enhance = compose(
    firebaseConnect(),
    connect(({firebase: { auth, profile }}) => ({auth, profile}))
);

export default enhance(withGoogleReCaptcha(User));
