import React, {useState} from "react";
import {Icon, Input} from "semantic-ui-react";

const InputPasswordPreview = (props) => {
    const [type, setType] = useState('password');

    const toggleType = () => {
        setType(type === 'password' ? 'text' : 'password')
    }

    return (
        <Input type={type} {...props}
               icon={<Icon name={type === 'password' ? 'eye' : 'eye slash outline'} circular className="password-preview" onClick={toggleType} link/>}
        />
    )
}

export default InputPasswordPreview;