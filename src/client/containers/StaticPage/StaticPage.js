import React, {useEffect, useState} from 'react';
import "./StaticPage.scss";
import {Button, Container, Dimmer, Header, Loader, Segment} from "semantic-ui-react";
import renderHTML from "react-render-html";

const StaticPage = (props) => {
    const { close, match: {params: {slug}, url} } = props;
    const [data, setData] = useState(null);

    useEffect(() => {
        props.open();
        getData();
    }, [url]);

    const getData = () => {
        fetch(`${process.env.PUBLIC_URL}/static/${slug}.json`,{
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        )
            .then(function(res){
                return res.json();
            })
            .then(function(json) {
                setData(json)
            });
    }

    return (
        <Container fluid className="static-page">
            {
                data ? (
                    <>
                        <Segment clearing basic>
                            <Button basic onClick={close} floated="right" icon="x" />
                            <Header as="h1" floated="left" size="large">
                                {data.title}
                            </Header>
                        </Segment>
                        <Segment clearing basic>
                            <div className="content">
                                {renderHTML(data.content)}
                            </div>
                        </Segment>
                    </>
                ) : (
                    <Dimmer active inverted>
                        <Loader size="large">Proszę czekać...</Loader>
                    </Dimmer>
                )
            }

        </Container>
    )
};

export default StaticPage;