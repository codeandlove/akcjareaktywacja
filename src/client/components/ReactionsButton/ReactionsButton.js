import React, {useEffect, useState} from 'react';
import {Icon, Popup} from "semantic-ui-react";

const ReactionsButton = (props) => {
    const [amount, setAmount] = useState(0);
    const [mostReactions, setMostReactions] = useState([]);
    const {children, data: {reactions}, position} = props;

    useEffect(() => {
        let totalAmount = 0;

        if(reactions){
            let sortReactions = {},
                sortResult = {};

            Object.keys(reactions).forEach((key) => {
                sortReactions = {
                    ...sortReactions,
                    [key]: reactions[key].length
                }
            });

            sortResult = Object.entries(sortReactions).sort((a,b) => b[1]-a[1]).map(el=> {
                return {
                    name: el[0],
                    amount: el[1]
                }
            });

            setMostReactions(sortResult);

            const reactionsToArray = Object.keys(reactions).map((key) => {
                return reactions[key].map(item => item.uid);
            }).reduce((a, b) => {
                return a.concat(b);
            }, []);

            totalAmount = reactionsToArray.length;
        }
        setAmount(totalAmount);
    }, [reactions])

    const displayReactions = () => {
        let limitedMostReactions = mostReactions.slice(0, 2);
        return limitedMostReactions.length && amount > 0 ? limitedMostReactions.map((item) => {
            const {amount, name} = item;
            return (
                <span><Icon name={name} /> {amount > 99 ? '+99' : amount} </span>
            )
        }) : <Icon name="smile outline" color="grey" />
    }

    const getLabel = (amount) => {
        return amount < 1 ? ` zareaguj` : '';
    }

    return (
        <Popup
            content={<>{children}</>}
            on='click'
            position={position || 'bottom right'}
            pinned
            trigger={<span>{displayReactions()} {getLabel(amount)}</span>}
        />
    );
}

export default ReactionsButton;