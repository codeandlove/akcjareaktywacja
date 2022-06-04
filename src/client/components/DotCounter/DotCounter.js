import React, {useEffect, useState} from 'react';
import {Label} from "semantic-ui-react";

const DotCounter = (props) => {
    const [count, setCount] = useState(0);
    const {data, lastKey, color} = props;

    useEffect(() => {
        if(lastKey && data) {
            let position = Object.keys(data).length;

            Object.keys(data).map((value, index) => {
                if(value === lastKey) {
                    position = index;
                }
            });

            setCount(Object.keys(data).length - 1 - position)

        }
    }, [data, lastKey])

    const countMsg = count > 9 ? '9+' : count;

    return count > 0 ? (
        <Label circular color={color || 'red'} size="mini" floating as="span" className="red-dot">
            {countMsg}
        </Label>
    ) : <></>;
};

export default DotCounter;