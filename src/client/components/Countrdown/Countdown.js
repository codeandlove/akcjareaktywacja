// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react';
import moment from "moment";

class Countdown extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            time: null,
            currentTime: moment().valueOf(),
            endLabel: 'Właśnie trwa...'
        }
    }
    
    componentDidMount() {
        const {currentTime} = this.state;
        const isInPast = (moment(this.props.toDate).diff(moment(), "days", true) < -.5);

        if(isInPast) {
            this.setState({
                endLabel: 'Spotkanie dobiegło końca.',
                time: 0
            });

            return;

        }

        this.setState({
            time: moment(this.props.toDate)/1000
        });

        if(currentTime > moment(this.props.toDate)) {
            this.decr = setInterval(this.update, 1000);
        }
    }
    
    update = () => {
        const {currentTime} = this.state;
        const newTime = this.state.time - 1; // minus one sec from initial time

        this.setState({
            time: currentTime < moment(this.props.toDate) ? newTime : 0
        });

        if(this.state.time === 0){
            clearInterval(this.decr);
        }
    };

    displayUnit = (time, labelFew, labelSingle, colon) => {
        return time > 0 ? `${time} ${time === 1 ? labelSingle : labelFew}${colon ? `,`:``}` : '';
    }

    render() {
        const {time, currentTime, endLabel} = this.state;
        const formattedDate = moment(this.props.toDate);
        const msDiff = formattedDate - currentTime;
        const days = parseInt(msDiff / (24 * 3600 * 1000), 10);
        const hours = parseInt(msDiff / (3600 * 1000) - (days * 24), 10);
        const mins = parseInt(msDiff / (60 * 1000) - (days * 24 * 60) - (hours * 60), 10);
        const secs = parseInt(msDiff / (1000) - (mins * 60) - (days * 24 * 60 * 60) - (hours * 60 * 60), 10);

        return time > 0 ?
            days > 0
                ? `${this.displayUnit(days, 'dni', 'dzień', false)}`
                : `${this.displayUnit(hours, 'godzin', 'godzina', true)} ${this.displayUnit(mins, 'minut', 'minuta', true)} ${this.displayUnit(secs, 'sekund', 'sekunda', false)}`
            : endLabel;

    }
    
}

export default Countdown;