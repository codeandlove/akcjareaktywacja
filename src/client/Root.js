import React, {useEffect, useState} from 'react';

import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { Helmet } from "react-helmet";
import App from './containers/App/App';
import GDPRModal from "./containers/GDPRModal/GDPRModal";
import PWAPrompt from 'react-ios-pwa-prompt'
import { store, history } from './store/store';
import {verifyAppCheck} from "../firebase/appCheck";
import {formatSlackNotifyMessage, getIPInfoApiUrl, notifyToSlackChannel} from "./utils";
import picture from "../assets/picture.webp";
import {Dimmer, Loader} from "semantic-ui-react";
import {SLACK_NEW_VISITOR_HOOK} from "./consts";

export const Root = () => {
    const [loading, setLoading] = useState(true);
    const [appCheck, setAppCheck] = useState(true);

    useEffect(async () => {
        if(process.env.NODE_ENV === 'production') {
            await verifyAppCheck().then(result => {
                if(!result) {
                    setAppCheck(false);

                    fetch(getIPInfoApiUrl()).then((response) => response.json()).then((jsonResponse) => {
                        notifyToSlackChannel(SLACK_NEW_VISITOR_HOOK,
                            {
                                "text": "App check failed.",
                                "blocks": [
                                    {
                                        "type": "section",
                                        "text": {
                                            "type": "mrkdwn",
                                            "text": `Nie udana weryfikacja połączenia. `
                                        }
                                    },
                                    {
                                        "type": "section",
                                        "text": {
                                            "type": "mrkdwn",
                                            "text": `${formatSlackNotifyMessage(jsonResponse)}`
                                        }
                                    }
                                ]
                            }
                        );
                    })
                } else {
                    setLoading(false);
                }
            });
        } else {
            setLoading(false);
        }

    }, [])

    if(loading) {
        if(!appCheck) {
            return (
                <div className="bug-container">
                    <img src={picture} className="picture-img" alt="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." title="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." />
                    <strong>Przepraszamy, serwis chwilowo niedostępny... Wróć do nas za parę minut.</strong>
                    <p>Jeśli problem się powtarza, daj nam znać na: <a href="mailto:akcjareaktywacjaofficial@gmail.com">akcjareaktywacjaofficial@gmail.com</a></p>
                </div>
            )
        }

        return (
            <Dimmer active inverted>
                <Loader size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    return (
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <>
                    <Helmet>
                        <meta charSet="utf-8" />
                        <title>Akcjareaktywacja.pl | Spotkania na żywo</title>
                        <meta name="description" content="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." />
                        <link rel="canonical" href="https://akcjareaktywacja.pl" />
                    </Helmet>
                    <GDPRModal/>
                    <PWAPrompt
                        copyTitle="Zainstaluj jako aplikację"
                        copyBody="Ta strona pozwala na uruchamianie jej jako aplikacji w telefonie, wystarczy że postąpisz zgodnie z poniższą instrukcją:"
                        copyShareButtonLabel="1) Przyciśnij przycisk 'Share' poniżej"
                        copyAddHomeButtonLabel="2) Wybierz pozycję 'Do ekranu początkowego.'"
                        copyClosePrompt="Zamknij"
                        delay={60000}
                    />
                    <App history={history} />
                </>
            </ConnectedRouter>
        </Provider>
    )
};
