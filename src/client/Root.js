import React from 'react';

import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { Helmet } from "react-helmet";
import App from './containers/App/App';
import GDPRModal from "./containers/GDPRModal/GDPRModal";

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
                    <GDPRModal />
                    <App history={history} />
                </>
            </ConnectedRouter>
        </Provider>
    )
};
