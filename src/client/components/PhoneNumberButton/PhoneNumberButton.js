import React, {useState} from 'react';
import {Button, Label} from "semantic-ui-react";
import {findPhoneNumber} from "../../utils";

const PhoneNumberButton = (props) => {
    const {text} = props;
    const [isVisible, setIsVisible] = useState(false);

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