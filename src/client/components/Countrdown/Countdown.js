import {useEffect, useState} from 'react';
import dayjs from "dayjs";
import {useInterval} from "../../hooks";

// Keep it for a tests;
// let toDate = dayjs().add(10, 'second').valueOf();

const Countdown = (props) => {
    const {toDate} = props;
    const [label, setLabel] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    useEffect( () => {
        const currentTime = dayjs().valueOf();
        const daysDifference = dayjs(toDate).diff(dayjs(), "days", true);
        const isInPast = daysDifference < -.5;
        const isCurrently = daysDifference < 0;
        const isInFuture =  daysDifference >= 1;

        if(isInPast) {
            setLabel('Spotkanie dobiegło końca.');
            return;
        }

        if(isCurrently) {
            setLabel('Właśnie trwa...');
            return;
        }

        if(isInFuture) {
            setLabel(renderTimer());
            return;
        }

        if(currentTime < dayjs(toDate).valueOf()) {
            setIsRunning(true);
        }

        return () => setIsRunning(false);
    }, [isRunning] );

    useInterval(() => {
        setLabel(renderTimer());
    }, isRunning ? 1000 : null)

    const renderTimer = () => {
        const currentTime = dayjs().valueOf();
        const formattedDate = dayjs(toDate).valueOf();
        const msDiff = formattedDate - currentTime;
        const days = parseInt(msDiff / (24 * 3600 * 1000), 10);
        const hours = parseInt(msDiff / (3600 * 1000) - (days * 24), 10);
        const mins = parseInt(msDiff / (60 * 1000) - (days * 24 * 60) - (hours * 60), 10);
        const secs = parseInt(msDiff / (1000) - (mins * 60) - (days * 24 * 60 * 60) - (hours * 60 * 60), 10);

        if(msDiff <= 0) {
            setIsRunning(false);
        }

        return days > 0
            ? `${displayUnit(days, 'dni', 'dzień', false)}`
            : `${displayUnit(hours, 'godzin', 'godzina', true)} ${displayUnit(mins, 'minut', 'minuta', true)} ${displayUnit(secs, 'sekund', 'sekunda', false)}`
    }

    const displayUnit = (time, labelFew, labelSingle, colon) => {
        return time > 0 ? `${time} ${time === 1 ? labelSingle : labelFew}${colon ? `,`:``}` : '';
    }

    return label;
}

export default Countdown;