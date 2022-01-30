import React from 'react';
import {bindActionCreators} from "redux";
import * as actionCreators from "../../actions";
import {connect} from "react-redux";
import {Button} from "semantic-ui-react";

const ShowOnMap = (props) => {
    const showEventLocationOnMap = () => {
        const {close, map, isMobile} = props;

        if(isMobile) {
            close();
        }

        map.flyTo(props.coordinates, 16);
    }

    return (
        <Button basic size="tiny" circular color="olive" onClick={showEventLocationOnMap} floated="right" icon="map marker alternate" />
    );
}

const mapStateToProps = state => {
    return {
        ...state.map
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowOnMap);