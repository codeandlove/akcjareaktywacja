import React from 'react';
import './MarkerWithInfo.scss';
import {Button, Item} from 'semantic-ui-react'
import {Marker, Popup} from 'react-leaflet';

import { Link } from "react-router-dom";

import moment from "moment";

import './MarkerWithInfo.scss';
import {icon} from "leaflet";
import {ACTION} from "../../routers";
import {isInPastDate} from "../../utils";

const MarkerWithInfo = (props) => {
    const { data, position } = props;

    const isInPast = isInPastDate(data.date, 0);

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
                <Item className="marker-item-popup">
                    <Item.Header as="h4">
                        <Link to={`/${ACTION}/${data.slug}`}>
                            {data.title}
                        </Link>
                    </Item.Header>
                    <Item.Meta>
                        <small><strong>{moment(data.date).format("DD MMMM YYYY, HH:mm")} | {data.owner}</strong></small>
                    </Item.Meta>
                    <Item.Description>
                        <p>{data.short}</p>
                    </Item.Description>
                    <Item.Extra>
                        <Link to={`/${ACTION}/${data.slug}`}>
                            <Button size="mini" color="olive">Zobacz</Button>
                        </Link>
                    </Item.Extra>
                </Item>
            </Popup>
        </Marker>
    )
}

export default MarkerWithInfo;