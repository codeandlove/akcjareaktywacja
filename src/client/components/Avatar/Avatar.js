import React from 'react';
import {Image} from "semantic-ui-react";

import avatarPlaceholder from "./../../../assets/profile_avatar.png";
import {PropTypes} from "prop-types";
import {compose} from "redux";
import {firebaseConnect} from "react-redux-firebase";
import {connect} from "react-redux";

const Avatar = ({auth, profile, size}) => {
    const {avatarImage} = profile;

    return (
        <Image src={avatarImage || auth.photoURL || avatarPlaceholder} size={size || 'mini'} avatar />
    )
}

Avatar.propTypes = {
    firebase: PropTypes.object.isRequired
}

const enhance = compose(
    firebaseConnect(),
    connect(({firebase: { auth, profile }}) => ({
        auth,
        profile
    }))
)

export default enhance(Avatar);