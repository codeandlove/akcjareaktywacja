import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { BrowserRouter } from 'react-router-dom';
import { Root } from './client/Root';
import './index.scss';

ReactDOM.render(
    <GoogleReCaptchaProvider
        reCaptchaKey={process.env.REACT_APP_RECAPTCHA_API_V3}
        useRecaptchaNet={false}
        useEnterprise={false}
        scriptProps={{
            async: true, // optional, default to false,
            defer: false, // optional, default to false
            appendTo: 'body', // optional, default to "head", can be "head" or "body",
            nonce: undefined // optional, default undefined
        }}
    >
        <BrowserRouter>
            <Root />
        </BrowserRouter>
    </GoogleReCaptchaProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

