import React, {useState} from 'react';
import './ShareButton.scss';

import {
    EmailIcon,
    EmailShareButton,
    FacebookShareButton,
    FacebookMessengerShareButton,
    TwitterShareButton,
    WhatsappShareButton
} from "react-share";
import {Button, Modal, Icon, Segment, Label } from "semantic-ui-react";

const ShareButton = (props) => {
    const {url} = props;
    const shareUrl = `${window.location.origin}${url}`;
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
        })
    }

    return (
        <Modal
            trigger={
                <Button icon labelPosition="right">
                    Podziel się
                    <Icon name="share" />
                </Button>
            }
            header='Udostępnij wydarzenie'
            content={
                <Modal.Content>
                    <Button as='div' labelPosition='left'>
                        <Label as='span' basic pointing='right' size="mini">
                            <span className="url-link">{shareUrl}</span>
                        </Label>
                        <Button icon onClick={copyToClipboard} color='olive'>
                            <Icon name='copy'/>
                            {copied ? 'Skopiowano' : 'Skopiuj'}
                        </Button>
                    </Button>
                    <Segment textAlign="center">
                        <div className="share-buttons">
                            <EmailShareButton url={shareUrl}>
                                <Button circular color='red' icon='envelope' />
                            </EmailShareButton>
                            <FacebookShareButton url={shareUrl}>
                                <Button circular color='facebook' icon='facebook' />
                            </FacebookShareButton>
                            <TwitterShareButton url={shareUrl}>
                                <Button circular color='twitter' icon='twitter' />
                            </TwitterShareButton>
                            <WhatsappShareButton url={shareUrl}>
                                <Button circular color='green' icon='whatsapp' />
                            </WhatsappShareButton>
                        </div>
                    </Segment>
                </Modal.Content>
            }
            actions={
                [
                    { key: 'Zamknij', content: 'Zamknij', color: 'blue' }
                ]
            }
        />
    )

    return (
        <div>
            <EmailShareButton url={shareUrl}>
                <EmailIcon url={shareUrl} />
            </EmailShareButton>
            <FacebookShareButton url={shareUrl}/>
            <FacebookMessengerShareButton url={shareUrl} />
            <TwitterShareButton url={shareUrl}/>
            <WhatsappShareButton url={shareUrl}/>
        </div>
    );
};

export default ShareButton;