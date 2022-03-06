import React, {useState} from 'react';
import {Button, Label} from "semantic-ui-react";

const PhoneNumberButton = (props) => {
    const {text} = props;
    const [isVisible, setIsVisible] = useState(false);
    const regex = new RegExp(/(?:(?:(?:\+|00)?48)|(?:\(\+?48\)))?(?:1[2-8]|2[2-69]|3[2-49]|4[1-8]|5[0-9]|6[0-35-9]|[7-8][1-9]|9[145])\d{7}/g);

    const findPhoneNumber = (val) => {
        return regex.test(val);
    }

    if(!findPhoneNumber(text)) {
        return text;
    }

    return isVisible ? (
        <Label as="a" content={text} icon="phone" size="large" href={`tel:${text}`} />
    ) : (
        <Button onClick={() => setIsVisible(true)} color="olive" icon="phone" content="Zobacz" compact />
    );
};

export default PhoneNumberButton;