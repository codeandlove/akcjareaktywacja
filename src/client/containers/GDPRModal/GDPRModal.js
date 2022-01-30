import React, {useEffect, useState} from 'react';
import './GDPRModal.scss';
import {Button, Container, Segment} from "semantic-ui-react";
import { useCookies } from 'react-cookie';
import {Link} from "react-router-dom";
import {STATIC} from "../../routers";

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
        <Container className="GDPR-modal" fluid>
            <Segment size="mini" compact>
                <p>W celu świadczenia usług na najwyższym poziomie stosujemy pliki cookies. W każdym momencie mogą Państwo dokonać zmiany ustawień Państwa przeglądarki internetowej i wyłączyć opcję zapisu plików cookies. Ze szczegółowymi informacjami dotyczącymi cookies na tej stronie można się zapoznać tutaj: <Link to={`${process.env.PUBLIC_URL}/${STATIC}/privacy-policy`}>polityka prywatności</Link> oraz <Link to={`${process.env.PUBLIC_URL}/${STATIC}/gdpr`}>infroamcja RODO</Link>. Korzystanie z serwisu oznacza akceptacje <Link to={`${process.env.PUBLIC_URL}/${STATIC}/regulamin`}>Regulaminu</Link>.</p>
                <Button color="olive" size="mini" floated="right" onClick={handleAccept}>Akcpetuje</Button>
            </Segment>
        </Container>
    ) : <></>;
};

export default GDPRModal;