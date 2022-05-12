import React, {useEffect, useState} from 'react';
import {bindActionCreators} from "redux";
import moment from "moment";
import {connect} from "react-redux";
import * as actionCreators from "./../../actions";
import {EVENTS_LIST} from "../../routers";
import {withRouter} from "react-router-dom";
import {Button, Grid, Icon} from "semantic-ui-react";

const EventsPagination = (props) => {
    const [currentDate, setCurrentDate] = useState(moment().startOf('day').valueOf());

    const goToPrevWeek = () => {
        const {setDateFrom, setDateTo, history} = props;
        const dateFrom = moment(currentDate).subtract( 7, 'days').startOf('day');
        const dateTo = moment(dateFrom).add( 6, 'days');

        setCurrentDate(dateFrom);
        setDateFrom(dateFrom);
        setDateTo(dateTo);

        history.replace(`/${EVENTS_LIST}`);
    }

    const goToNextWeek = () => {
        const {setDateFrom, setDateTo, history} = props;
        const dateFrom = moment(currentDate).add( 7, 'days').startOf('day');
        const dateTo = moment(dateFrom).add( 6, 'days');

        setCurrentDate(dateFrom);
        setDateFrom(dateFrom);
        setDateTo(dateTo);

        history.replace(`/${EVENTS_LIST}`);
    }

    return (
        <Grid>
            <Grid.Column mobile={8} tablet={8} computer={8}>
                <Button onClick={goToPrevWeek} size='mini' floated='left'>
                    <Icon name="long arrow alternate left" />
                    Poprzedni tydzień
                </Button>
            </Grid.Column>
            <Grid.Column mobile={8} tablet={8} computer={8}>
                <Button onClick={goToNextWeek} size='mini' floated='right'>
                    Następny tydzień
                    <Icon name="long arrow alternate right" />
                </Button>
            </Grid.Column>
        </Grid>
    );
};

const mapStateToProps = state => {
    return {
        settings: state.settings
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EventsPagination));

