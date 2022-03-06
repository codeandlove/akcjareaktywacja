import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
