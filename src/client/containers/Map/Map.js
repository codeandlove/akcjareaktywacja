 import React, {useState, useEffect, useMemo, useRef} from 'react'
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap } from 'react-leaflet'
import './Map.scss'
import { icon, latLng, latLngBounds } from "leaflet"
import MarkerWithInfo from "../MarkerWithInfo/MarkerWithInfo"
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { bindActionCreators } from "redux";
import * as actionCreators from "../../actions";

import {connect} from "react-redux";
import {Button, Dimmer, Loader} from "semantic-ui-react";

const EventMarkerLocator = (props) => {
    const {event, updateEvent, isMobile, isColOpen} = props
    const [position, setPosition] = useState(null)
    const [location, setLocation] = useState(null)
    const [prevPosition, setPrevPosition] = useState(null)
    const [prevLocation, setPrevLocation] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const markerRef = useRef(null)

    useEffect(() => {
        if(event && event.coordinates) {
            setPosition(event.coordinates)
            setEditMode(true);
            map.flyTo(event.coordinates, map.getZoom())
        } else {
            setPosition(null)
        }

        if(event && event.location) {
            setLocation(event.location);
        }
    }, [event]);

    useEffect(() => {
        if(markerRef.current) {
            markerRef.current.openPopup()
        }

        if(!prevPosition){
            setPrevPosition(position);
        }

    }, [position, prevPosition])

    useEffect(() => {
        if(!prevLocation) {
            setPrevLocation(location)
        }
    }, [location, prevLocation]);

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom())
        }
    })

    const cancelEvent = () => {
        const {cancelEvent} = props
        setEditMode(false)
        setPosition(null)
        cancelEvent()
    }

    const addEvent = () => {
        const {addEvent} = props

        setEditMode(true)
        setPrevPosition(null)
        setPrevLocation(null)

        addEvent({...position})
    }

    const cancelPositionChange = () => {
        updateEvent({
            coordinates: {
                ...prevPosition
            }
        })
    }

    const markerIcons = {
        ongoing: icon({
            iconUrl: "/markers/ongoing.png",
            iconSize: [32, 32],
        }),
        inpast: icon({
            iconUrl: "/markers/inpast.png",
            iconSize: [32, 32],
        }),
        newone: icon({
            iconUrl: "/markers/newone.png",
            iconSize: [32, 32],
        })
    }

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                if (markerRef.current) {
                    const newPos = markerRef.current.getLatLng();

                    map.flyTo(newPos, map.getZoom())

                    setPosition(newPos)

                    setTimeout(() => markerRef.current.openPopup(), 500)
                }
            },
        }),
        []
    )

    const popupContent = () => {
        const isPositionChanged = (position && prevPosition) && (position.lat !== prevPosition.lat ||
            position.lng !== prevPosition.lng);

        return editMode ? (
            <>
                {
                    isPositionChanged ? (
                        <>
                            {
                                location !== prevLocation ? (
                                    <>
                                        <p>Ustawiono nowe miejsce na mapie.</p>
                                        <Button onClick={addEvent} color="olive" size="mini">Zatwierdź</Button>
                                    </>
                                ) : (
                                    <>
                                        <p>Ustawiono nowe miejsce na mapie, czy zatwierdzić?</p>
                                        <Button onClick={cancelPositionChange} size="mini">Anuluj</Button>
                                        <Button onClick={addEvent} color="olive" size="mini">Zatwierdź</Button>
                                    </>
                                )
                            }
                        </>
                    ) : (
                        <>
                            <p>Kliknij gdzieś lub przeciągnij pineskę, aby zmienić pozycję na mapie.</p>
                            {
                                (isMobile || !isColOpen) && (
                                    <Button onClick={addEvent} color="olive" size="mini">Wróć</Button>
                                )
                            }
                        </>
                    )
                }
            </>
        ):(
            <>
                <p>Dodać nowe wydarzenie?</p>
                <Button onClick={() => cancelEvent()} size="mini">Nie</Button>
                <Button onClick={() => addEvent()} color="olive" size="mini">Tak</Button>
            </>
        )
    }

    return position ? (
        <Marker ref={markerRef} position={position} icon={markerIcons.newone} draggable={true} eventHandlers={eventHandlers}>
            <Popup>
                {popupContent()}
            </Popup>
        </Marker>
    ) : <></>
}

const ResizeEvent = () => {
    const map = useMap()
    const [containerBoundingBox, setContainerBoundingBox] = useState(map.getContainer().getBoundingClientRect())

    useEffect(() => {
        const currentContainerBoundingBox = map.getContainer().getBoundingClientRect()
        if(currentContainerBoundingBox.width !== containerBoundingBox.width ||
            currentContainerBoundingBox.left !== containerBoundingBox.left ||
            currentContainerBoundingBox.right !== containerBoundingBox.right
        ) {
            resizeMap()
            setContainerBoundingBox(currentContainerBoundingBox)
        }

        window.addEventListener('resize', () => resizeMap(), false)

        return window.removeEventListener('resize', () => resizeMap(), false)
    })

    const resizeMap = () => {
        setTimeout(() => map.invalidateSize(true), 2000)
    }

    return <></>;
}

const MapContextExporter = (props) => {
    const map = useMap()

    useEffect(() => {
        props.setMap(map)
    }, [map])

    return <></>
}

const Map = (props) => {
    const {events, recent, client: {defaultCoordinates}, map} = props
    const [markers, setMarkers] = useState()

    useEffect(() => {
        if(map) {
            const southWest = latLng( -89.98155760646617, -180),
                northEast = latLng( 89.99346179538875, 180),
                bounds = latLngBounds(southWest, northEast);

            map.setMaxBounds(bounds)
            map.setMinZoom(3)
        }

        if(!recent) return

        const data = {...events, ...recent};

        if(!data) return;

        const markers = Object.keys(data).map((key) => {
            const event = data[key];
            return <MarkerWithInfo key={`marker-${key}`} position={event.coordinates} data={event} viewEvent={() => this.props.viewEvent(key)}/>
        })

        setMarkers(markers)
    }, [events, recent])

    if(!defaultCoordinates) {
        return (
            <Dimmer active inverted>
                <Loader size="large">Proszę czekać...</Loader>
            </Dimmer>
        )
    }

    return (
        <div id="map">
            <MapContainer center={[defaultCoordinates.lat, defaultCoordinates.lng]} zoom={13} scrollWheelZoom={true} >
                <TileLayer
                    attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MarkerClusterGroup showCoverageOnHover={false}>
                    {
                        markers
                    }
                </MarkerClusterGroup>
                <EventMarkerLocator {...props} />
                <ResizeEvent />
                <MapContextExporter {...props} />
            </MapContainer>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        ...state.map,
        client: state.client
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
