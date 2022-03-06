import React from 'react';

import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { Helmet } from "react-helmet";
import App from './containers/App/App';
import GDPRModal from "./containers/GDPRModal/GDPRModal";
import PWAPrompt from 'react-ios-pwa-prompt'

export const Root = (props) => {

    // Create an enhanced history that syncs navigation events with the store
    const {history, store } = props;

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
                    />
                    <App history={history} />
                </>
            </ConnectedRouter>
        </Provider>
    )
};
