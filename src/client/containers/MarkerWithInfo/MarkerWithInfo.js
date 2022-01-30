import React, {useMemo} from 'react';
import { Card } from 'semantic-ui-react'
import {Marker, Popup} from 'react-leaflet';

import { Link } from "react-router-dom";

import moment from "moment";

import './MarkerWithInfo.scss';
import {icon} from "leaflet";
import {ACTION} from "../../routers";
import {isInPastDate} from "../../utils";

const MarkerWithInfo = (props) => {
    const { data, position } = props;

    const isInPast = isInPastDate(data.date);

    const markerIcons = {
        ongoing: icon({
            iconUrl: "/markers/ongoing.png",
            iconSize: [32, 32],
        }),
        inpast: icon({
            iconUrl: "/markers/inpast.png",
            iconSize: [32, 32],
        })
    }

    return (
        <Marker position={position} icon={isInPast ? markerIcons.inpast : markerIcons.ongoing}>
            <Popup>
                <Card>
                    <Card.Content>
                        <Card.Header>{data.title}</Card.Header>
                        <Card.Meta>
                            <span className='date'>{moment(data.date).format("DD MMMM YYYY, HH:mm")}</span>
                        </Card.Meta>
                        <Card.Description>
                            <p>
                                <em>{data.owner}</em>
                            </p>
                            <p>{data.short}</p>
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra textAlign="right">
                        <Link to={`/${ACTION}/${data.slug}`}>
                            {
                                isInPast ? `Zobacz ${data.title}` : `Dołącz do ${data.title}`
                            }
                        </Link>
                    </Card.Content>
                </Card>
            </Popup>
        </Marker>
    )
}

export default MarkerWithInfo;