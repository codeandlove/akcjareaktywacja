import React, {useEffect, useState} from 'react';
import './UserStatusIndicator.scss';
import {Popup} from "semantic-ui-react";

const UserStatusIndicator = (props) => {
    const {status, asAvatar, children} = props;
    const [userOnline, setUserOnline] = useState(false);

    useEffect(() => {
        if(status) {
            setUserOnline(statusToBool());
        }
    }, [status])

    const statusToBool = () => status === 'online';

    if(!status) {
        return children;
    }

    return (
        <Popup
            size="mini"
            inverted
            trigger={
                <div className={`user-status-indicator ${userOnline ? 'online' : 'offline'} ${asAvatar ? 'avatar' : ''}`}>
                    {children}
                </div>
            }
            content={userOnline ? 'online': 'offline'}
            position='bottom right'
        />
    )
};

export default UserStatusIndicator;