// hangoutList.jsx

import React from 'react';
import update from 'react-addons-update';
import _ from 'underscore';

import {HangoutStore} from '../stores/hangoutStore';
import {ParticipantStore} from '../stores/participantStore';
import HangoutActions from '../actions/HangoutListActionCreators'

import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';

import Colors from 'material-ui/lib/styles/colors';
import CheckCircle from 'material-ui/lib/svg-icons/action/check-circle';
import HighlightOff from 'material-ui/lib/svg-icons/action/highlight-off';
import Clear from 'material-ui/lib/svg-icons/content/clear';
import RaisedButton from 'material-ui/lib/raised-button';
import IconButton from 'material-ui/lib/icon-button';

import Avatar from 'material-ui/lib/avatar';



class HangoutRow extends React.Component {
    constructor(props, context) {
        console.log("props:", props);
        super(props, context);
        this.handleClickClear = this.handleClickClear.bind(this);
    }


    getIcon(active) {
        if (active) {
            return (
                <CheckCircle color={Colors.green500} />
            );
        } else {
            return (
                <HighlightOff color={Colors.red500} />
            );
        }
    }

    getAvatar(participant, i) {
        if (!participant.image_url) {
            return (
                <Avatar>{participant.name.charAt(0)} key={i}</Avatar>
            );
        } else {
            return (
                <Avatar src={participant['image_url']} key={i}/>
            );
        }
    }

    getAvatars() {
        return (
            <div>
                {this.props.participants.map((participant, i) =>
                    this.getAvatar(participant, i)
                )}
            </div>
        );

    }

    handleClickClear(event) {
        HangoutActions.updateHangoutActive(this.props.hangout._id, false);
    }

    render() {
        return (
            <TableRow>
                <TableRowColumn>{this.props.hangout.hangout_id}</TableRowColumn>
                <TableRowColumn>{this.getIcon(this.props.hangout.active)}</TableRowColumn>
                <TableRowColumn>{this.getAvatars()}</TableRowColumn>
                <TableRowColumn>
                    <RaisedButton
                        label="Set Inactive"
                        icon={<Clear/>}
                        onClick={this.handleClickClear}
                        disabled={!this.props.hangout.active}
                    />
                </TableRowColumn>
            </TableRow>
        );
    }
}


export default class HangoutTable extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.hangoutsChanged = this.hangoutsChanged.bind(this);
        this.participantsChanged = this.participantsChanged.bind(this);
        this.state = {
            hangouts: HangoutStore.getAll(),
            participants: ParticipantStore.getParticipantsByHangout()
        }
    }

    
    hangoutsChanged() {
        this.setState({hangouts: update(this.state.hangouts,
                                        {$set: HangoutStore.getAll()})
        });
    }

    participantsChanged() {
        this.setState({participants: update(this.state.participants,
                                            {$set: ParticipantStore.getParticipantsByHangout()})
        });
    }

    getParticipantFromHangout(hangout_id) {
        return this.state.participants[hangout_id] || [];
    }

    componentWillMount() {
    }

    componentDidMount() {
        HangoutStore.bind("change", this.hangoutsChanged);
        ParticipantStore.bind("change", this.participantsChanged);
    }

    componentWillUnmount() {
        HangoutStore.unbind('change', this.hangoutsChanged);
        ParticipantStore.unbind("change", this.participantsChanged);
    }

    render() {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHeaderColumn>Hangout ID</TableHeaderColumn>
                        <TableHeaderColumn>Active?</TableHeaderColumn>
                        <TableHeaderColumn>Participants</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {this.state.hangouts.map((hangout, i) =>
                        <HangoutRow hangout={hangout}
                                    participants={this.getParticipantFromHangout(hangout.hangout_id)}
                                    key={hangout.hangout_id} ></HangoutRow>
                     )};
                </TableBody>
            </Table>
        );
    }
}

