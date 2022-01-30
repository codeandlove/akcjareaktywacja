import React, { Component } from "react";
import PropTypes, { instanceOf } from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreators from "./../../actions";
import { withCookies, Cookies } from 'react-cookie';
import DatePicker from "react-datepicker";
import {Form, Radio, Input, Modal, Header, Button, Icon, Checkbox} from "semantic-ui-react";
import {getBool} from "../../utils";

class Settings extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    componentWillUnmount() {
        const { settings, cookies } = this.props;
        const data = {
            ...settings,
            date_from: settings.date_from,
            date_to: settings.date_to,
        };

        cookies.set('data', {...data}, {
            path: "/",
            maxAge: 24 * 3600
        });
    }

    close = () => {
        const { router } = this.context;
        router.history.replace('/');
    };

    changeViewType = (e, { value }) => {
        this.props.setViewType(value);
    };

    toggleRecentEvents = (e, {value}) => {
        const {toggleRecentEvents} = this.props;
        toggleRecentEvents(!getBool(value));
    }

    handleChange = name => event => {
        switch(name) {
            case "dateFrom":
                this.props.setDateFrom(event);
                break;
            case "dateTo":
                this.props.setDateTo(event);
                break;
            default:
                this.setState({
                    [name]: event.target.value
                });
        }
    };

    render() {
        const {settings: {view_type, date_from, date_to, show_recent_events}} = this.props;

        return (
            <Modal
                open={true}
                closeIcon
                onClose={() => this.close()}
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
                                <Radio label="Tygodnie" name="viewGroup" value="weeksView" checked={view_type === "weeksView"} onChange={this.changeViewType}/>
                            </Form.Field>
                            <Form.Field>
                                <Radio label="Lista" name="viewGroup" value="listView" checked={view_type === "listView"} onChange={this.changeViewType}/>
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>Data początkowa:</label>
                                <DatePicker
                                    customInput={<DateFrom />}
                                    selected={date_from}
                                    onChange={this.handleChange("dateFrom")}
                                    dateFormat="LL"
                                    locale="pl"
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>Data końcowa:</label>
                                <DatePicker
                                    customInput={<DateTo />}
                                    selected={date_to}
                                    onChange={this.handleChange("dateTo")}
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
                                <Checkbox label="Pokaż ostatnie wydarzenia" onClick={this.toggleRecentEvents} value={`${show_recent_events}`} defaultChecked={show_recent_events}/>
                            </Form.Field>
                        </Form.Group>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.close}>
                        <Icon name="checkmark" /> Zastosuj
                    </Button>
                </Modal.Actions>
            </Modal>
        )

    }
}

class DateFrom extends Component {
    render() {
        return <Input placeholder="Data początkowa:" type="text" id="date_from" name="date_from" value={this.props.value} onClick={this.props.onClick} onFocus={this.props.onClick} />
    }
}

class DateTo extends Component {
    render() {
        return <Input placeholder="Data końcowa:" type="text" id="date_to" name="date_to" value={this.props.value} onClick={this.props.onClick} onFocus={this.props.onClick} />
    }
}

Settings.contextTypes = {
    router: PropTypes.object
};

const mapStateToProps = state => {
    return {
        settings: state.settings
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Settings));

