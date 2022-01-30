import React, {useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import './Dropzone.scss';

const Dropzone = (props) => {
    const [files, setFiles] = useState([]);
    const {getRootProps, getInputProps} = useDropzone({
        accept: 'image/*',
        maxFiles: 1,
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        }
    });

    useEffect(() => {
        const {setUploadedImage} = props;
        setUploadedImage(files);
    }, [files]);

    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (
        <section className="container">
            <div {...getRootProps({className: 'dropzone'})}>
                <input {...getInputProps()} />
                <div className="drop-zone-file">Kliknij tutaj aby dodać zdjęcie</div>
            </div>
        </section>
    );
}

export default Dropzone;