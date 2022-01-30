import React, {useEffect, useRef, useState} from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import {Button, Modal} from "semantic-ui-react";

const CropImageModal = (props) => {
    const {isOpen} = props;

    const closeModal = () => {
        const {closeModal} = props;
        closeModal();
    }

    return (
        <Modal
            onClose={closeModal}
            // onOpen={() => setOpen(true)}
            open={isOpen}
        >
            <Modal.Header>Dostosuj zdjęcie</Modal.Header>
            <Modal.Content >
                {props.children}
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Zatwierdź"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={closeModal}
                    positive
                />
            </Modal.Actions>
        </Modal>
    )
}

const CropImage = (props) => {
    const {image, setCroppedImageRawData} = props;
    const cropperRef = useRef(null);
    const [open, setOpen] = useState(!!image);

    useEffect(() => {
        setOpen(true);
    }, [image])

    const closeModal = () => {
        setOpen(false);
    }

    const onCrop = () => {
        if(cropperRef.current) {
            const imageElement = cropperRef.current;
            const cropper = imageElement.cropper;
            setCroppedImageRawData(cropper.getCroppedCanvas().toDataURL());
        }
    };

    return (
        <CropImageModal isOpen={open} closeModal={closeModal}>
            <Cropper
                src={image}
                style={{ height: 400, width: "100%" }}
                initialAspectRatio={1}
                aspectRatio={1}
                guides={false}
                responsive={true}
                autoCrop={true}
                ready={onCrop}
                cropend={onCrop}
                ref={cropperRef}
            />
        </CropImageModal>
    );
}

export default CropImage;