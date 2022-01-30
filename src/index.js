import React from 'react';
import ReactDOM from 'react-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { BrowserRouter } from 'react-router-dom';

import { Root } from './client/Root';

import './index.scss';

import { store, history } from './client/store/store';

ReactDOM.render(
    <GoogleReCaptchaProvider
        reCaptchaKey={process.env.REACT_APP_RECAPTCHA_API_V3}
        useRecaptchaNet={false}
        useEnterprise={false}
        scriptProps={{
            async: true, // optional, default to false,
            defer: true, // optional, default to false
            appendTo: 'body', // optional, default to "head", can be "head" or "body",
            nonce: undefined // optional, default undefined
        }}
    >
        <BrowserRouter>
            <Root store={store} history={history} />
        </BrowserRouter>
    </GoogleReCaptchaProvider>,
    document.getElementById('root')
);