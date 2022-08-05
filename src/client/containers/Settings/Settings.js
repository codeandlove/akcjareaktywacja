import React, {forwardRef, useEffect} from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreators from "./../../actions";
import DatePicker from "react-datepicker";
import {Form, Radio, Input, Modal, Header, Button, Icon, Checkbox} from "semantic-ui-react";
import {getBool} from "../../utils";
import {withRouter} from "react-router";
import moment from "moment";

const Settings = (props) => {
    const { settings, history, setViewType, toggleRecentEvents, setDateFrom, setDateTo,
        settings: {view_type, date_from, date_to, show_recent_events}} = props;

    useEffect(() => {
        return () => {
            const data = {
                ...settings,
                date_from: settings.date_from,
                date_to: settings.date_to,
            };
        }
    }, [])

    const close = () => {
        history.replace('/');
    };

    const changeViewType = (e, { value }) => {
        setViewType(value);
    };

    const setupRecentEvents = (e, {value}) => {
        toggleRecentEvents(!getBool(value));
    }

    const handleChange = name => event => {
        switch(name) {
            case "dateFrom":
                setDateFrom(event);
                break;
            case "dateTo":
                setDateTo(event);
                break;
            default:
               return null;
        }
    };

    return (
        <Modal
            open={true}
            closeIcon
            onClose={close}
        >
            <Header icon="sliders" content="Ustawienia" />
            <Modal.Content>
                <h3>Filtruj wydarzenia</h3>
                <Form>
                    <Form.Group>
                        <Form.Field>
                            <label>Wyświetlaj jako:</label>
                        </Form.Field>
                        <Form.Field>
                            <Radio label="Tygodnie" name="viewGroup" value="weeksView" checked={view_type === "weeksView"} onChange={changeViewType}/>
                        </Form.Field>
                        <Form.Field>
                            <Radio label="Lista" name="viewGroup" value="listView" checked={view_type === "listView"} onChange={changeViewType}/>
                        </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                        <Form.Field>
                            <label>Data początkowa:</label>
                            <DatePicker
                                customInput={<DateFrom />}
                                selected={moment(date_from)}
                                onChange={handleChange("dateFrom")}
                                dateFormat="LL"
                                locale="pl"
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Data końcowa:</label>
                            <DatePicker
                                customInput={<DateTo />}
                                selected={moment(date_to)}
                                onChange={handleChange("dateTo")}
                                dateFormat="LL"
                                locale="pl"
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Group>
                        <Form.Field>
                            <label>Ostatnie wydarzenia:</label>
                        </Form.Field>
                        <Form.Field>
                            <Checkbox label="Pokaż ostatnie wydarzenia" onClick={setupRecentEvents} value={`${show_recent_events}`} defaultChecked={show_recent_events}/>
                        </Form.Field>
                    </Form.Group>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button positive onClick={close}>
                    <Icon name="checkmark" /> Zastosuj
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

const DateFrom = forwardRef((props, ref) => {
    const {value, onClick} = props;
    return <Input ref={ref} placeholder="Data od:" type="text" id="date_from" name="date_from" value={value} onClick={onClick} onFocus={onClick} />
});

const DateTo = forwardRef((props, ref) => {
    const {value, onClick} = props;
    return <Input ref={ref} placeholder="Data do:" type="text" id="date_to" name="date_to" value={value} onClick={onClick} onFocus={onClick} />
});

const mapStateToProps = state => {
    return {
        settings: state.settings
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Settings));

