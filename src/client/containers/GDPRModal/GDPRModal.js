import React, {useEffect, useState} from 'react';
import './GDPRModal.scss';
import {Button, Container, Segment} from "semantic-ui-react";
import { useCookies } from 'react-cookie';
import {Link} from "react-router-dom";
import {GDPR, PRIVACY_POLICY, STATIC, TERMS_OF_USE} from "../../routers";

const GDPRModal = () => {
    const [accept, setAccept] = useState(false);
    const [cookies, setCookie] = useCookies('gdpr');

    useEffect(() => {
        if(cookies.gdpr === '1') {
            setAccept(true)
        }
    },[]);

    const handleAccept = () => {
        setCookie('gdpr', '1', { path: '/' });
        setAccept(true);
    }

    return !accept ? (
        <div className="GDPR-modal">
            <Segment size="mini" compact>
                <p>W celu świadczenia usług na najwyższym poziomie stosujemy pliki cookies. W każdym momencie mogą Państwo dokonać zmiany ustawień Państwa przeglądarki internetowej i wyłączyć opcję zapisu plików cookies. Ze szczegółowymi informacjami dotyczącymi cookies na tej stronie można się zapoznać tutaj: <Link to={`${process.env.PUBLIC_URL}/${STATIC}/${PRIVACY_POLICY}`}>polityka prywatności</Link> oraz <Link to={`${process.env.PUBLIC_URL}/${STATIC}/${GDPR}`}>infroamcja RODO</Link>. Korzystanie z serwisu oznacza akceptacje <Link to={`${process.env.PUBLIC_URL}/${STATIC}/${TERMS_OF_USE}`}>Regulaminu</Link>.</p>
                <Button color="olive" size="mini" floated="right" onClick={handleAccept}>Akcpetuje</Button>
            </Segment>
        </div>
    ) : <></>;
};

export default GDPRModal;