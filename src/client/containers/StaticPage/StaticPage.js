import React, {useEffect, useState} from 'react';
import "./StaticPage.scss";
import {Button, Dimmer, Header, Loader, Segment} from "semantic-ui-react";
import renderHTML from "react-render-html";
import {bindActionCreators, compose} from "redux";
import * as actionCreators from "../../actions";
import {connect} from "react-redux";

const StaticPage = (props) => {
    const { openPage, closePage, match: {params: {slug}, url} } = props;
    const [data, setData] = useState(null);

    useEffect(() => {
        openPage();
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
        <div className="static-page">
            {
                data ? (
                    <>
                        <Segment clearing basic>
                            <Button basic onClick={closePage} floated="right" icon="x" />
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
                        <Loader active size="large">Proszę czekać...</Loader>
                    </Dimmer>
                )
            }

        </div>
    )
};


const mapStateToProps = state => {
    return {
        ...state.layout
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps)
)(StaticPage);
