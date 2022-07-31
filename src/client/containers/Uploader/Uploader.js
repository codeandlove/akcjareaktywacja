import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import Dropzone from '../../components/Dropzone/Dropzone';

import { connect } from "react-redux";
import { compose } from "redux";
import { firebaseConnect } from "react-redux-firebase";

import "./Uploader.scss";
import CropImage from "../../components/CropImage/CropImage";
import {resizeImage} from "../../utils";
import {Container} from "semantic-ui-react";


const Uploader = ({ setAvatarImage }) => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [croppedImageRawData, setCroppedImageRawData] = useState(null);
    const [croppedImageData, setCroppedImageData] = useState(null);

    useEffect(() => {
        try {
            resizeImage(croppedImageRawData, 150, 150).then((data) => {
                setCroppedImageData(data);
                setAvatarImage(data);
            });
        } catch (error) {
            console.log(error);
        }
    }, [croppedImageRawData])

    return (
        <div>
            <Dropzone setUploadedImage={image => setUploadedImage(image)}/>
            {
                uploadedImage && uploadedImage.length > 0 ? (
                    <Container textAlign="center">
                        {croppedImageData ? <img width="100" src={croppedImageData} /> : <></>}
                        <CropImage image={uploadedImage[0].preview} setCroppedImageRawData={croppedImageRawData => setCroppedImageRawData(croppedImageRawData)}/>
                    </Container>
                ) : <></>
            }
        </div>
    )
}

Uploader.propTypes = {
    firebase: PropTypes.object.isRequired
};

const enhance = compose(
    firebaseConnect(),
    connect(({firebase: { auth, profile }}) => ({auth, profile}))
);

export default enhance(Uploader);